"use strict";

function GroupQuestions(e, container) {
  var _this = this;

  this.element = e;
  this.container = container;

  this.setOrder = function (n) {
    _this.element.querySelector(".order").innerText = n;
  };

  this.addToContainer = function () {
    _this.container.append(_this.element);
  };

  this.tagify = function () {
    var newTagify = new Tagify(_this.element.querySelector('.tagify'), tagifyOptions);
  };

  this.remove = function () {
    _this.element.remove();
  };

  this.removeBtn = function () {
    _this.element.querySelector('button.btn-danger').addEventListener("click", function () {
      _this.remove();
    });
  };
}

var groups = [];
groups.push(new GroupQuestions(document.querySelector(".group-part")));
var container = document.querySelector('.group-questions');
document.getElementById("add-group").addEventListener("click", function () {
  var newGroup = new GroupQuestions(htmlToElement(htmlString), container);
  groups.push(newGroup);
  newGroup.addToContainer();
  newGroup.tagify();
  newGroup.removeBtn();
});
var htmlString = '<div class="group-part"><h5>Nhóm <span class="order"></span><button class="btn btn-sm btn-danger" type="button">Xóa</button></h5><div class="row mb-1"><div class="col-6"><input class="tagify form-control h-100" name="tags" type="text" placeholder="Chủ đề" required></div><div class="col-2"><input class="form-control" name="numberOfQuestions" type="number" placeholder="Số câu" required></div><div class="col-2"><input class="form-control" name="min_level" type="number" placeholder="Độ dễ" required></div><div class="col-2"><input class="form-control" name="max_level" type="number" placeholder="Độ khó" required></div></div></div>';

function htmlToElement(html) {
  var template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result

  template.innerHTML = html;
  return template.content.firstChild;
}