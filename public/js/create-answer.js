
(function() {
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
        extraPlugins: 'ckeditor_wiris',
        // For now, MathType is incompatible with CKEditor file upload plugins.
        removePlugins: 'uploadimage,uploadwidget,uploadfile,filetools,filebrowser',
        // Update the ACF configuration with MathML syntax.
        extraAllowedContent: mathElements.join(' ') + '(*)[*]{*};img[data-mathml,data-custom-editor,role](Wirisformula)'  
    }

    CKEDITOR.plugins.addExternal('ckeditor_wiris', 'https://ckeditor.com/docs/ckeditor4/4.15.0/examples/assets/plugins/ckeditor_wiris/', 'plugin.js');

    CKEDITOR.replace('question_content', options);
    CKEDITOR.replace('answer_content[0]', options);
    CKEDITOR.replace('answer_content[1]', options);
    CKEDITOR.replace('answer_content[2]', options);
    CKEDITOR.replace('answer_content[3]', options);
    CKEDITOR.replace('detailed_answer', options);

    // document.getElementById('form-question').addEventListener('submit', function(e) {
    //     e.preventDefault();
    //     var data = CKEDITOR.instances.question_content.getData();
    //     console.log(data);
    // })
  }());