function removeQuestion(id) {
    fetch('/api/remove-question', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({ questionId: id })
    })
        .then(res => res.json())
        .then(res => {
            if (res.status == 200) {
                document.getElementById('item-'+id).remove();
                document.querySelectorAll('.order').forEach((e, i) => { e.innerText = `Câu ${i + 1}: ` });
            }
            alert(res.message);
        });

}