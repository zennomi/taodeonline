function addQuestion(id) {
    fetch('/api/add-question', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({questionId: id})
    })
    .then(res => res.json())
    .then(res => {
        if (res.status == 200) {
            let number = document.getElementById('number');
            number.innerText = Number(number.innerText)+1;
        }
        alert(res.message);
    });
}