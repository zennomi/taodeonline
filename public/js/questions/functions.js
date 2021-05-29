var numberEle;
getMethod('/api/questions/memory', (res) => {
    document.getElementById('userName').innerHTML += `  <span id="numMemQues" class="badge badge-default">${res.questionsIds.length}</span>`
    numberEle = document.getElementById('numMemQues');
});

const addQuestion = (id) => {
    anotherMethod('/api/questions/memory', 'POST', { questionId: id }, (res) => {
        numberEle.innerHTML = res.ids.length;
        notify('Hệ thống', res.message);
    }, handleError);
}

const removeQuestion = (id, func = () => {}) => {
    anotherMethod('/api/questions/memory', 'DELETE', { questionId: id }, (res) => {
        numberEle.innerHTML = res.ids.length;
        notify('Hệ thống', res.message);
        return id;
    }, handleError).then(func);
}

const handleError = async (res) => {
    return notify('Hệ thống', res.error);

}