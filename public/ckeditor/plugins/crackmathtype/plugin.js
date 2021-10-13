CKEDITOR.plugins.add( 'crackmathtype', {
    icons: 'crackmathtype',
    init: function( editor ) {
        // Plugin logic goes here...
        editor.addCommand( 'removeBlock', {

			// Define the function that will be fired when the command is executed.
			exec: function( editor ) {
				document.querySelectorAll('.wrs_tickContainer').forEach(element => {
					element.remove();
				});
				console.log("Cracked!");
			}
		});

		// Create the toolbar button that executes the above command.
		editor.ui.addButton( 'Crackmathtype', {
			label: 'Crack Mathtype',
			command: 'removeBlock',
			toolbar: 'wiris'
		});
    }
});