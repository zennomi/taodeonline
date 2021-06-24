// fix option width
function optionArea(containerWidth) {
    document.querySelectorAll('.optionArea').forEach(area => {
        area.classList.remove("row-cols-4", "row-cols-2");
        area.classList.add("row-cols-1");
        let width = containerWidth || area.offsetWidth;
        let maxOptionWidth = Math.max(...Array.from(area.childNodes).map(o => {
            //             console.log(Array.from(o.childNodes).map(c => c.offsetWidth).reduce((a, b) => a + b));
            return Array.from(o.childNodes).map(c => c.offsetWidth).reduce((a, b) => a + b);
        }));
        if (maxOptionWidth < width / 4) area.classList.add("row-cols-4");
        else if (maxOptionWidth < width / 2) area.classList.add("row-cols-2");
    })
}