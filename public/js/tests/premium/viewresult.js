// view result

function splitBreak(label) {
    if (/\s/.test(label)) {
        label = label.split(" ").slice(0, 2);
        label = [label.join(" ")];
        label.push("...");
        return label;
    } else {
        return label;
    }
}

function viewResult(id) {
    anotherMethod('/api/result/view', 'POST', { id }, res => {
        let result = res.result;
        var scatterChart = new Chart(document.getElementById('scatterChart'), {
            type: 'line',
            data: {
                datasets: [{
                        label: 'Khoanh đúng',
                        data: res.choices.filter(c => c.isTrue).map(c => { return { x: c.index, y: c.moment } }),
                        backgroundColor: 'rgba(45,206,137,0.4)',
                        borderColor: 'rgba(45,206,137,1)',
                    },
                    {
                        label: 'Khoanh sai',
                        data: res.choices.filter(c => !c.isTrue).map(c => { return { x: c.index, y: c.moment } }),
                        backgroundColor: 'rgba(245,54,92,0.4)',
                        borderColor: 'rgba(245,54,92,1)',
                    }
                ]
            },
            options: {
                maintainAspectRatio: true,
                aspectRatio: 1,
                showLine: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Thứ tự câu'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Thời gian (phút)'
                        },
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        })

        var dataRadar = {
            labels: Object.keys(res.topics).map(k => screen.width < 600 ? splitBreak(k) : k),
            datasets: [{
                label: "Kỹ năng",
                fill: true,
                lineTension: 0.1,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: Object.entries(res.topics).map(t => Math.ceil(t[1].count / t[1].total * 10)),
                spanGaps: false,
            }]
        };

        var myRadarChart = new Chart(document.getElementById('radarchart'), {
            type: 'radar',
            data: dataRadar,
            options: {
                // maintainAspectRatio: false,
                layout: {
                    padding: 0
                },
                legend: {
                    display: false,
                },
                scale: {
                    ticks: {
                        min: 0,
                        max: 10
                    }
                }
            }
        });
    })
}