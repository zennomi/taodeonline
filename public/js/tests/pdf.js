function optionArea() {

    document.querySelectorAll('.optionArea').forEach(area => {
        let maxOptionWidth = Math.max(...Array.from(area.childNodes).map(o => {
            console.log(Array.from(o.childNodes));
            console.log(Array.from(o.childNodes).map(c => c.offsetWidth));
            //             console.log(Array.from(o.childNodes).map(c => c.offsetWidth).reduce((a, b) => a + b));
            return Array.from(o.childNodes).map(c => c.offsetWidth).reduce((a, b) => a + b);
        }));
        console.log(area, maxOptionWidth);
        if (maxOptionWidth < 718 / 4) area.classList.add("row-cols-4");
        else if (maxOptionWidth < 718 / 2) area.classList.add("row-cols-2");
        else area.classList.add("row-cols-1");
    })

}