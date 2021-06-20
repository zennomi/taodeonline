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
        toolbar: [
            { name: 'document', items: ['Source', '-', 'NewPage', 'Preview', '-', 'Templates'] },
            { name: 'basicstyles', groups: ['basicstyles', 'cleanup'], items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'] },
            { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
            { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'], items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
            { name: 'insert', items: ['Image', 'Table', 'SpecialChar'] },
            { name: 'wiris', items: ['ckeditor_wiris_formulaEditor'] }
        ],
        removeButtons: '',
        uiColor: 'var(--bs-light)',
        height: 600,
        extraPlugins: 'ckeditor_wiris,pastebase64,pastetools',
        extraAllowedContent: mathElements.join(' ') + '(*)[*]{*};img[data-mathml,data-custom-editor,role](Wirisformula)'
    }

    CKEDITOR.plugins.addExternal('ckeditor_wiris', 'https://ckeditor.com/docs/ckeditor4/4.15.0/examples/assets/plugins/ckeditor_wiris/', 'plugin.js');
    CKEDITOR.plugins.addExternal('pastebase64', '/pastebase64/', 'plugin.js');
    CKEDITOR.plugins.addExternal('pastetools', '/pastetools/', 'plugin.js');
    CKEDITOR.replace('content', options);
}());
let importBtn = document.getElementById('importBtn');
let importForm = document.getElementById('importForm');
importBtn.onclick = () => {
    importForm.action = '/questions/import/save';
    importForm.submit();
}