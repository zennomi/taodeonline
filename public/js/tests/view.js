function deleteResult(id) {
	if (confirm("Xóa kết quả này?")) {
		postData('/api/result/delete', { id })
			.then(res => {
				alert(res.message);
			})
	}
}
var resultModalEle = document.getElementById('resultModal');
var resultModal = new bootstrap.Modal(resultModalEle, {});
const nameStdEle = document.getElementById('nameStudent');
const modalContentEle = document.getElementById('modalContent');
const chartEle = document.getElementById('scatterChart');
var scatterChart;
resultModalEle.addEventListener('hidden.bs.modal', function (event) {
	scatterChart.destroy();
  })
function viewResult(id) {
	postData('/api/result/view', { id })
		.then(res => {
			if (res.status === 200) {
				resultModal.show();
				console.log(res.result);
				let result = res.result;
				nameStdEle.textContent = result.user.display_name;
				modalContentEle.innerHTML = `
				<div><b>Thời gian bắt đầu: </b>${(new Date(result.started_time)).toLocaleString('vi-VN')}</div>
				<div><b>Thời gian kết thúc: </b>${result.finished_time ? "Chưa nộp bài" : (new Date(result.finished_time)).toLocaleString('vi-VN')}</div>
				<div><b>Số lần rời khỏi khu vực thi: </b>${result.leaves_area_times}</div>
				<div></div>
			`;
				let dataChart = res.choices.map((c, i) => { return { x: i, y: c } });
				console.log(dataChart);
				scatterChart = new Chart(chartEle, {
					type: 'scatter',
					data: {
						datasets: [{
							label: 'Thời gian khoanh',
							data: dataChart,
							backgroundColor: 'rgb(255, 99, 132)'
						}]
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