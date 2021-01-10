function GroupQuestions (e, container) {
    this.element = e;
    this.container = container;
    this.setOrder = (n) => {
        this.element.querySelector(".order").innerText = n;
    }
    this.addToContainer = () => {
        this.container.append(this.element);
    }
    this.tagify = () => {
        let newTagify = new Tagify(this.element.querySelector('.tagify'), tagifyOptions);
    }
    this.remove = () => {
        this.element.remove();
    }
    this.removeBtn = () => {
        this.element.querySelector('button.btn-danger').addEventListener("click", () => {
            this.remove();
        })
    }
}

let groups = [];
groups.push(new GroupQuestions(document.querySelector(".group-part")));

let container = document.querySelector('.group-questions');

document.getElementById("add-group").addEventListener("click", () => {
    let newGroup = new GroupQuestions(htmlToElement(htmlString), container)
    groups.push(newGroup);
    newGroup.addToContainer();
    newGroup.tagify();
    newGroup.removeBtn();
})


const htmlString = '<div class="group-part"><h5>Nhóm <span class="order"></span><button class="btn btn-sm btn-danger" type="button">Xóa</button></h5><div class="row mb-1"><div class="col-6"><input class="tagify form-control h-100" name="tags" type="text" placeholder="Chủ đề" required></div><div class="col-2"><input class="form-control" name="numberOfQuestions" type="number" placeholder="Số câu" required></div><div class="col-2"><input class="form-control" name="min_level" type="number" placeholder="Độ dễ" required></div><div class="col-2"><input class="form-control" name="max_level" type="number" placeholder="Độ khó" required></div></div></div>';
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}