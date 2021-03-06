var default_content = [
    '"use strict";',
    'function Person(age) {',
    '   if (age) {',
    '       this.age = age;',
    '   }',
    '}',
    'Person.prototype.getAge = function () {',
    '   return this.age;',
    '};'
].join('\n');

var sendCursor=false;
var sendContent = true;
var sendTab=true;

require.config({ paths: { 'vs': 'monaco-editor/min/vs' }});
require(['vs/editor/editor.main'], editor_function);

function editor_function() {
    if(content.length===0){
        var editor = setup_editor('container-0', default_content, 'javascript');
        editors.push(editor);
        editorID.push(0);
        filenames.push('default.js');
    }
    else{
        var editor = setup_editor('container-0', content[0], lang[0]);
        editors.push(editor);
        sendTab = false;
        for(var i=1;i<content.length;i++){
            var editor_ = new_tab(filenames[i], content[i], lang[i], false, editorID[i]);
        }
        sendTab = true;

    }
}

$('#new-tab').on('click', function(){
    new_tab('', default_content, 'javascript', true, -1);
});

$('.tab').on('click',function(){
    var id = parseInt($(this).attr('id').split('-')[1]);
    if(id!==current_ID){
        switch_tab(id);
    }
});

socket.on('cursor', function(msg){
    showEvent('remote cursor change - ' + msg);
    $('#'+msg.id+'label').remove();

    if(msg.editor_id===current_ID){
        var width = editors[current_ID].getConfiguration().fontInfo.typicalHalfwidthCharacterWidth;
        console.log(width);
        var y = $("[lineNumber="+msg.lineNumber+"]").position().top;
        var x = Math.round((msg.column-1)*width); // need improvement
        $('#'+msg.id).remove();
        create_cursor(msg.id, y, x, msg.color);
        $('#'+msg.id+'label').remove();
        var cur= $('<div/>',{
               'class': 'object',
               'id': msg.id + 'label',
               'css':{'top': y-15, 'left': x,  'background-color': msg.color},
               'text': msg.username
        });
        $("#container-"+current_ID+" .cursors-layer").append(cur);
        $('#'+msg.id+'label').fadeOut(1500); 
   }

});

socket.on('content', function(msg){
    //showEvent('remote content change - ' + msg);

    sendContent=false;
    editors[msg.editor_id].executeEdits('keyboard', [{
        identifier: {major: 0, minor: 0},
        range: monaco.Range.lift(msg.range),
        text: msg.text,
        forceMoveMarkers: false,
        isAutoWhitespaceEdit: false
    }]);
    sendContent=true;
})


socket.on('new-user', function(msg){
    //showEvent("new user: " + msg);
    create_cursor(msg, 0, 0);
});

socket.on('user-exit', function(msg){
    $('#'+msg).remove();   //remove cursor
    $('#'+msg+'label').remove();  //remove label
});

socket.on('request-content', function(msg){
    console.log('content requested');
    var content=[];
    var lang=[];
    for(var i=0;i<editors.length;i++){
        content.push(editors[i].getValue());
        lang.push(editors[i].getModel().getModeId());
    }
    socket.emit('reply-content', {
        content: content,
        language: lang,
        filenames: filenames,
        editorID: editorID
    });
});

socket.on('new-tab', function(msg){
    console.log('new-tab '+ msg);
    sendTab=false;
    new_tab(msg.tab_name, msg.content, msg.language, false, msg.new_ID);
    sendTab=true;
});

$("#file-upload").on('change', function(e){
    var file = e.target.files[0];
    var filename = file.name;
    var split_name = filename.split('.');
    var extension = split_name[split_name.length-1];
    var new_lang = get_type(extension);
    var reader = new FileReader();
    reader.readAsText(file);
    sendContent=false;
    reader.onload = function(f){
        new_tab(filename, f.target.result, new_lang, true, -1);
        socket.emit("new-file", {
            filename: filename,
            content: f.target.result,
            language: new_lang
        });
    };
    sendContent=true;
});

$("#save-as").on('click',function(){
    var file_blob = new Blob([editors[current_ID].getValue()], {type:'text/plaint'});
    var file_name = filenames[current_ID];
    var downloadLink = document.createElement("a");
    downloadLink.download = file_name;
    downloadLink.innerHTML = "Download File";
    downloadLink.setAttribute("target", "_blank");
    if (window.webkitURL != null)
    {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(file_blob);
    }
    else
    {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(file_blob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();
});


$("#rename").click(function(){
    $('#rename').css({'line-height':'100%'});
    $("#cancel").show();
    $("#ins").show();
    $(".tab").off("click");

    $("#cancel").click(function(event){        
        $("#rename-form").hide();
        $("#cancel").hide();
        $("#ins").hide();
        $('#rename').css({'line-height':'40px'});
        $(".tab").off("click");
        $('.tab').click(click_tab);
        event.stopPropagation();
        return false;
    });

    $(".tab").click(function(){
        var id = parseInt($(this).attr('id').split('-')[1]);
        $("#rename-form").show();
        $("#ins").text("You have selected file: "+filenames[id]);
        $("#rename-input").val(filenames[id]);

        $("#rename-form").submit(function(event){
            if($("#rename-input").val()!==''){
                filenames[id]=$("#rename-input").val();
                $('#tab-'+id).text($("#rename-input").val());
                var split_name = filenames[id].split('.');
                var extension = split_name[split_name.length-1];
                var new_lang = get_type(extension);
                if(new_lang!==editors[id].getModel().getModeId()){
                    var model = editors[id].getModel();
                    monaco.editor.setModelLanguage(model, new_lang);
                    editors[id].setModel(model);
                }
                socket.emit("rename", {
                    tabID: id,
                    filename: $("#rename-input").val()
                });

            }
            $("#rename-form").hide();
            $('#rename').css({'line-height':'40px'});
            $("#cancel").hide();
            $("#ins").hide();
            $(".tab").off("click");
            $("#rename-form").off('submit');
            $(".tab").click(click_tab);
            event.stopPropagation();
            return false;
        });
    });
});


socket.on("rename", function(msg){
    filenames[msg.tabID]=msg.filename;
    $('#tab-'+msg.tabID).text(msg.filename);
});

$('#user-button').hover(function(){
    $("#online_users").slideDown(200);
    
},function(){
    $("#online_users").slideUp(200);
});


$('#load').hover(function(){
    $("#file-upload").fadeIn(500);
    if($('#load').height()>40){
        $('#load').css({'line-height':'100%'});
    }
},function(){
    $("#file-upload").hide();
    $('#load').css({'line-height':'40px'});
});



function showEvent(str) {
    var output = document.getElementById('output');
    while(output.childNodes.length > 10) {
        output.removeChild(output.firstChild.nextSibling.nextSibling);
    }
    output.appendChild(document.createTextNode(str));
    output.appendChild(document.createElement('br'));
}

function setup_editor(div, content, language){

    var editor = monaco.editor.create(document.getElementById(div), {
        value: content,
        language: language,
        glyphMargin: true,
        nativeContextMenu: false,
        theme: light?'vs':'vs-dark',
        automaticLayout: true
     });
        var decorations = editor.deltaDecorations([], [
        {
            range: new monaco.Range(3,1,3,1),
            options: {
                isWholeLine: true,
                className: 'myContentClass',
                glyphMarginClassName: 'myGlyphMarginClass'
            }
        }
    ]);

    // register two events
    editor.onDidChangeCursorPosition(function(e){
        showEvent('cursor change - ' + e.position + e.reason);

        if(e.reason!==0||sendCursor){
            socket.emit('cursor', { 
                id: socket.io.engine.id,
                editor_id: current_ID,
                lineNumber: e.position.lineNumber,
                column: e.position.column});
            sendCursor=false;
        }
    });
    editor.onDidChangeModelContent(function(e){
        if(sendContent){
            //showEvent('content change: '+ e.range + ' ' + e.rangeLength + ' ' + e.text);
            sendCursor=true;
            socket.emit('content', {
                editor_id: current_ID, 
                range: e.range, 
                text: e.text});
        }
    });
    
    return editor;
}

function create_cursor(user_id, y, x, color){
    $("#container-"+ current_ID +" .cursors-layer").append($('<div/>', {
        'class': 'other-cursor',
        'id': user_id,
        'css': {
            'background-color': color,
            'top': y,
            'left': x
        }
    }));
}

function new_tab(tab_name, content, language, foreground, new_ID){

    if(sendTab){
        socket.emit('new-tab', {
            tab_name: tab_name,
            content: content,
            language: language,
            new_ID: new_ID
        });
    }

    // create new tab
    if(new_ID===-1){
        new_ID = Math.max(...editorID)+1;

        // if(new_ID === 5) {
        //     alert("!!!!");
        //     $('.tab-bar').css({ 
        //         'height': '50%' 
        //     });
        //     $('.container').css({
        //         'height': '10%',
        //         'top': '90%',
        //         'visibility': 'hidden'
        //     });
        // }
    }   
    if(tab_name===''){
        tab_name = 'default_' + new_ID + '.js';
    }

    var new_li = $('<li/>',{
        'id': 'tab-' + new_ID,
        'class': 'tab',
        'text': tab_name,
        //'css': {'background-color': foreground?'Yellow':'White'}
    });

    $('.tab-bar').append(new_li);

    filenames.push(tab_name);

    var new_editor_ID = 'container-' + new_ID;

    // create div for new editor, and insert it
    var new_div = $('<div/>',{
        'id': new_editor_ID,
        'class': 'container',
        'css': { 'visibility': foreground?'visible':'hidden'}
    });
    new_div.insertAfter('#container-' + current_ID);
    // setup up new editor
    var editor = setup_editor(new_editor_ID, content, language);
    editors.push(editor);
    editorID.push(new_ID);
    
    if(foreground){
        // hide original editor
        switch_tab(new_ID);
        //$('#tab-' + current_ID).css('background-color', 'White');
        //$('#container-' + current_ID).css('visibility', 'hidden');
        //current_ID = new_ID;
    }

    // register click event for the tab
    new_li.on('click', click_tab);

    return editor;
}

function click_tab(){
    var id = parseInt($(this).attr('id').split('-')[1]);
    if(id!==current_ID){
        switch_tab(id);
    }
}

function switch_tab(new_id){
    //$('#tab-' + current_ID).removeClass('tab-selected');
    //$('#tab-' + current_ID).css('background-color', 'White');
    $('#container-' + current_ID).css('visibility', 'hidden');

    //$('#tab-' + current_ID).css('background-color', 'Yellow');
    $('#tab-' + new_id).addClass('tab-selected');
    $('#container-' + new_id).css('visibility', 'visible');
    $('#tab-' + new_id).css({
        'background-color':$('#tab-' + current_ID).css('background-color'),
        'color':light?'black':'white'
    });
    $('#tab-' + current_ID).removeClass('tab-selected');
    $('#tab-' + current_ID).css({'background-color':'#BBB','color':'#333'});
    current_ID = new_id;
}

function get_type(extension){
    switch(extension){
        case 'js':
            return 'javascript';
        case 'py':
            return 'python';
        case 'java':
            return 'java';
        case 'cpp':
            return 'cpp';
        case 'c':
            return 'c';
        case 'h':
            return 'c';
        case 'hpp':
            return 'cpp';
        case 'txt':
            return 'plaintext';
        case 'html':
            return 'html';
        case 'css':
            return 'css';
        case 'ts':
            return 'typescript';
        case 'cs':
            return 'csharp';
        case 'xml':
            return 'xml';
        case 'swift':
            return 'swift';
        case 'm':
            return 'objective-c';
        default:
            return 'plaintext';

    }
}


