function deleteResult(id) {
    if (confirm("Xóa kết quả này?")) {
        anotherMethod('/api/results/' + id, 'DELETE', {}, (res) => {
            notify('Hệ thống', res.message);
        })
    }
}
var resultModalEle = document.getElementById('resultModal');
var resultModal = new bootstrap.Modal(resultModalEle, {});
const nameStdEle = document.getElementById('nameStudent');
const modalContentEle = document.getElementById('modalContent');
const chartEle = document.getElementById('scatterChart');
var scatterChart;
resultModalEle.addEventListener('hidden.bs.modal', function(event) {
    scatterChart.destroy();
})

function viewResult(id) {
    anotherMethod('/api/result/view', 'POST', { id }, res => {
        if (res.status === 200) {
            resultModal.show();
            console.log(res.result);
            let result = res.result;
            nameStdEle.textContent = result.user.display_name;
            modalContentEle.innerHTML = `
			<div><b>Thời gian bắt đầu: </b>${(new Date(result.started_time)).toLocaleString('vi-VN')}</div>
			<div><b>Thời gian kết thúc: </b>${result.finished_time ? (new Date(result.finished_time)).toLocaleString('vi-VN') : "Chưa nộp bài"}</div>
			<div><b>Số lần rời khỏi khu vực thi: </b>${result.leaves_area_times}</div>
			<div><b>Địa chỉ IP: </b>${result.user.ip}</div>
			<div><b>Thiết bị: </b>${result.user.software}</div>
			<div></div>
		`;
            scatterChart = new Chart(chartEle, {
                type: 'scatter',
                data: {
                    datasets: [{
                            label: 'Khoanh đúng',
                            data: res.choices.filter(c => c.isTrue).map(c => { return { x: c.index, y: c.moment } }),
                            backgroundColor: 'rgb(25, 135, 84)'
                        },
                        {
                            label: 'Khoanh sai',
                            data: res.choices.filter(c => !c.isTrue).map(c => { return { x: c.index, y: c.moment } }),
                            backgroundColor: 'rgb(255, 99, 132)'
                        }
                    ]
                },
                options: {
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom'
                        }
                    }
                }
            })
        }
    })
}