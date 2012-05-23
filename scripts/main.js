// Currently selected note
var currentNote, 
    // notesList scroller
    scroller;

/**
 * Init function called when body onload is triggered
 */
function init() {
    // Parse.com API request settings
    $.ajaxSetup({
        headers : {
            "X-Parse-Application-Id" : "ZPIertSFvHEvqitVyHSO0X0mWbfeq7YSIH7cE1z8",
            "X-Parse-REST-API-Key" : "HOZKeyYQqNZ9lXjWhBHbkeVKhOqm1CmS3n7fhdZN"
        }
    });

    $(document).on("mobileinit", function() {
        // When in PG we can do Cross-Origin Resource Sharing
        $.support.cors = true;
        // We want to make cross domain calls
        $.mobile.allowCrossDomainPages = true;
        // We don't want default link click handling
        $.mobile.linkBindingEnabled = false;
        // We don't need this as we will be doing page navigation
        // programmatically
        $.mobile.hashListeningEnabled = false;
        // We don't need this as we will be doing page navigation
        // programmatically
        $.mobile.pushStateEnabled = false;
    });

    // Initialize notes list
    initNotesList();

    // Registering click handler on btnNew
    $('#btnNew').on('click', btnNew_clickHandler);

}

/**
 * btnNew click handler
 */
function btnNew_clickHandler(event) {
    // Clearing currentNote 
    currentNote = null;
    
    // Changing page to note.html
    $.mobile.changePage("note.html");
}

/**
 * Initializes notesList
 */
function initNotesList() {
    // Getting reference to notesList
    var $notesList = $('#notesList');

    // Creating iScroll to have nice scrolling effect
    scroller = new iScroll('notesListContainer');

    // Registering click handler
    $notesList.on('click', notesList_clickHandler);

    // Loading notes
    loadNotes();
}

/**
 * notesList click handler
 * @param event
 */
function notesList_clickHandler(event) {
    // Clicked list item
    var $listItem = $(event.target);

    // Setting currentNote to one bound with list item
    currentNote = $listItem.jqmData('note');
    
    // Changing page to note.html
    $.mobile.changePage("note.html");    
}

/**
 * Loads notes from Parse.com
 */
function loadNotes() {
    // Using jquery getJSON to load notes from Parse.com
    $.getJSON('https://api.parse.com/1/classes/Note', function(data) {

        var $notesList = $('#notesList'),
            // jquery ref to notes list item
            $listItem,
            items = [];
        
        // Clearing current notes in the list
        $notesList.empty();

        // Iterating over the returned results
        $.each(data.results, function(key, val) {
            // Creating new list item
            $listItem = $('<li/>').append(
                    // link to click in the list item
                    $('<a href="#"/>').html(val.title).jqmData('note', val));
            
            // Appending list item to array
            items.push($listItem[0]);
        });

        // Appending batch of list items
        $notesList.append(items);
        
        // Refreshing jquery.mobile list
        $notesList.listview('refresh');
        
        // Refreshing scroller
        scroller.refresh();
    });
}