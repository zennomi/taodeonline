
(function () {
  var mathElements = [
    'math',
    'maction',
    'maligngroup',
    'malignmark',
    'menclose',
    'merror',
    'mfenced',
    'mfrac',
    'mglyph',
    'mi',
    'mlabeledtr',
    'mlongdiv',
    'mmultiscripts',
    'mn',
    'mo',
    'mover',
    'mpadded',
    'mphantom',
    'mroot',
    'mrow',
    'ms',
    'mscarries',
    'mscarry',
    'msgroup',
    'msline',
    'mspace',
    'msqrt',
    'msrow',
    'mstack',
    'mstyle',
    'msub',
    'msup',
    'msubsup',
    'mtable',
    'mtd',
    'mtext',
    'mtr',
    'munder',
    'munderover',
    'semantics',
    'annotation',
    'annotation-xml'
  ];
  const options = {
    toolbar: [
      { name: 'basicstyles', groups: ['basicstyles', 'cleanup'], items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'] },
      { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
      { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'], items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
      { name: 'insert', items: ['Image', 'Table', 'SpecialChar'] },
      { name: 'wiris', items: ['ckeditor_wiris_formulaEditor', 'Crackmathtype'] }
    ],
    removeButtons: '',
    uiColor: 'var(--bs-light)',
    height: 200,
    extraPlugins: 'ckeditor_wiris,pastebase64,crackmathtype',
    extraAllowedContent: mathElements.join(' ') + '(*)[*]{*};img[data-mathml,data-custom-editor,role](Wirisformula)'
  }

  CKEDITOR.plugins.addExternal('ckeditor_wiris', 'https://ckeditor.com/docs/ckeditor4/4.15.0/examples/assets/plugins/ckeditor_wiris/', 'plugin.js');
  CKEDITOR.plugins.addExternal('pastebase64', '/ckeditor/plugins/pastebase64/', 'plugin.js');
  CKEDITOR.plugins.addExternal('crackmathtype', '/ckeditor/plugins/crackmathtype/', 'plugin.js');

  CKEDITOR.replace('question_content', options);
  CKEDITOR.replace('answer_content[0]', options);
  CKEDITOR.replace('answer_content[1]', options);
  CKEDITOR.replace('answer_content[2]', options);
  CKEDITOR.replace('answer_content[3]', options);
  CKEDITOR.replace('detailed_answer', options);
}());