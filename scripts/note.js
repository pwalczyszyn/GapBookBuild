// Registering pageinit handler 
$('#notePage').live('pageinit', notePage_pageinitHandler);

// Reference to newly stored photo
var newPhoto;

/**
 * notePage pageinit handler
 *
 * @param event
 */
function notePage_pageinitHandler(event) {

    // Setting note form properties if note selected
    if (currentNote) {
        // Setting note title
        $('#txtTitle').val(currentNote.title);
        // Setting note content
        $('#txtContent').val(currentNote.content);
        // Loading photo if available
        if (currentNote.photo) {
            $.mobile.showPageLoadingMsg("a", "Loading photo...", true);
            $.get(currentNote.photo.url, function (data) {
                $.mobile.hidePageLoadingMsg();
                $('#img').attr('src', data);
            });
        }
    } else {
        currentNote = {
            title:'',
            content:'',
            photo:null
        };
    }

    // Registering btnBack click handler
    $('#btnBack').on('click', btnBack_clickHandler);

    // Registering btnPhoto click handler
    $('#btnPhoto').on('click', btnPhoto_clickHandler);

}

/**
 * btnBack click handler
 *
 * @param event
 */
function btnBack_clickHandler(event) {
    var title = $('#txtTitle').val(), content = $('#txtContent').val();

    if (currentNote.title != title || currentNote.content != content
        || newPhoto != null)
    // Saving and closing current note
        saveAndClose(null);
    else
    // Returning back to the list view
        close();

}

function saveAndClose(newPhotoRef) {
    var isNew = !currentNote.objectId,
        url = 'https://api.parse.com/1/classes/Note' + (isNew ? '' : '/' + currentNote.objectId),
        type = isNew ? 'POST' : 'PUT',
        data = {};

    // If this is an update and new photo was taken
    if (!isNew && newPhoto && !newPhotoRef) {
        // Saving new photo
        savePhoto();
        // Returning saveNote function it will be automatically called after new
        // photo
        return;
    }

    var title = $('#txtTitle').val(), content = $('#txtContent').val();

    // Setting title if it has changed
    if (currentNote.title != title)
        data.title = title;

    // Setting content if it has changed
    if (currentNote.content != content)
        data.content = content;

    // Setting photo if it has changed
    if (newPhotoRef)
        data.photo = newPhotoRef;

    // Displaying note saving message
    $.mobile.showPageLoadingMsg("a", "Saving note...", true);

    $.ajax({
        url:url,
        type:type,
        contentType:'application/json',
        data:JSON.stringify(data),
        error:ajax_errorHandler,
        success:function saveNote_successHandler(result) {

            // Hiding message
            $.mobile.hidePageLoadingMsg();

            if (isNew) {
                // Setting objectId after creating new note
                currentNote.objectId = result.objectId;

                // Saving new photo
                if (newPhoto)
                    savePhoto();
                else
                    close();

            } else {

                // Clearing previous photo
                newPhoto = null;

                // Note was saved and it can be closed now
                close();
            }
        }
    });
}

/**
 * Saves taken photo and calls saveAndClose on success
 */
function savePhoto() {
    // Displaying photo upload message
    $.mobile.showPageLoadingMsg("a", "Uploading photo...", true);

    // Making the call to store photo file
    $.ajax({
        url:'https://api.parse.com/1/files/photo.b64',
        type:'POST',
        contentType:'text/plain',
        data:'data:image/jpeg;base64,' + newPhoto,
        error:ajax_errorHandler,
        success:function (result) {
            $.mobile.hidePageLoadingMsg();
            saveAndClose(result);
        }
    });
}

/**
 * Navigating back
 */
function close() {

    currentNote = null;

    // Returning back to the list view
    window.history.back();

    // Reloading notes list after save
    loadNotes();
}

/**
 * btnPhoto click handler
 *
 * @param event
 */
function btnPhoto_clickHandler(event) {
    // Camera app parameters
    var cameraParams = {
        quality:20,
        destinationType:Camera.DestinationType.DATA_URL
    };
    // Running built-in camera app
    navigator.camera.getPicture(camera_successHandler, function (message) {
        alert('Camera app on your device failed: ' + message);
    }, cameraParams);
}

/**
 * Camer success handler
 *
 * @param photoData
 */
function camera_successHandler(photoData) {
    // Setting #img src to the local file
    $('#img').attr('src', 'data:image/jpeg;base64,' + photoData);

    // Setting global variable with new photo data
    newPhoto = photoData;
}

/**
 * Handles ajax requests error events, by popping an alert and writing response
 * object structure
 *
 * @param jqXHR
 * @param textStatus
 * @param errorThrown
 */
function ajax_errorHandler(jqXHR, textStatus, errorThrown) {
    $.mobile.hidePageLoadingMsg();
    console.log(JSON.stringify(jqXHR));
    alert('Error saving note: ' + textStatus);
}
