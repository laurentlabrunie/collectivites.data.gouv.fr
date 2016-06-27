// Various utils
'use strict';
var Z = {

    qs: function (selector, element) {
        element = element || document.body;
        return element.querySelector(selector)
    },

    qsa: function (selector, element) {
        element = element || document.body;
        return element.querySelectorAll(selector);
    },

    // permet de retrouver le premier parent de l'élément correspondant au type d'élément demandé
    // selector: type d'élément ("UL", "LI", "DIV"...)
    // element: élément de départ de la recherche
    parents: function(selector, element) {
        var parent = element.parentElement;
        if (parent.nodeName.toUpperCase() == selector.toUpperCase()) return parent;
        else if (element != document.body) return Z.parents(selector, parent);
        else console.error('Pas de parent correspondant au "' + selector + '"');
    },

    el: function (what, attrs, parent, content) {
        var el = document.createElement(what);
        for (var attr in attrs || {}) el[attr] = attrs[attr];
        if (typeof parent !== 'undefined') parent.appendChild(el);
        if (content) {
            if (content.nodeType && content.nodeType === 1) el.appendChild(content);
            else el.innerHTML = content;
        }
        return el;
    },

    stop: function (e) {
        e.stopPropagation();
        e.preventDefault();
    },

    hasClass: function (el, name) {
        return el.className.length && new RegExp('(^|\\s)' + name + '(\\s|$)').test(el.className);
    },

    addClass: function (el, name) {
        el.className = (el.className ? el.className + ' ' : '') + name;
    },

    removeClass: function (el, name) {
        el.className = ((' ' + el.className + ' ').replace(' ' + name + ' ', ' ')).trim();
    },

    xhr: function (options) {
        var xhr = new XMLHttpRequest();
        xhr.open(options.verb, options.uri, true);
        if (options.mimetype) xhr.overrideMimeType('text/csv');
        if (options.headers) {
            for (var name in options.headers) {
                xhr.setRequestHeader(name, options.headers[name]);
            }
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && options.callback) options.callback(null, xhr);
        };
        if (options.onProgress) xhr.upload.addEventListener('progress', options.onProgress, false);
        if (options.onLoad) xhr.upload.addEventListener('progress', options.onLoad, false);

        try {
            xhr.send(options.data);
        } catch (e) {
            if (options.callback) options.callback(e);
            console.error('Bad Request', e);
        }
        return xhr;
    },

    post: function (options) {
        options = options || {};
        options.verb = 'POST';
        Z.xhr(options);
    },

    get: function (options) {
        options = options || {};
        options.verb = 'GET';
        Z.xhr(options);
    },

    hide: function(element) {
        Z.qs(element).style.display="none";
    },

    show: function(element) {
        Z.qs(element).style.display="inline-block";
    }

};

Z.fileUploader = function (options) {
    var reader = new FileReader(), file, container, blob, parsed;
    if (typeof options.container === 'string') container = Z.qs(options.container);
    else container = options.container || document.body;
    container.className = container.className + ' uploader';

    var download = Z.el('a', {}, download);
    download.style.display = 'none';
    Z.el('h2', {}, container, 'Choisir un fichier');
    var fileInput = Z.el('input', {type: 'file', id: 'fileInput'}, container);
    var holder = Z.el('div', {className: 'holder'}, container, 'Glisser le fichier ou <a id="browseLink" href="#"> choisir </a>');
    if (options.onBuild) options.onBuild({container: container});
    var submitButton = Z.el('input', {type: 'button', disabled: 'disabled', value: 'Envoyer'}, container);
    var errorContainer = Z.el('div', {className: 'error'}, container);
    var onSubmit = function (e) {
        Z.stop(e);
        Z.removeClass(container, 'has-error');

        var formData = new FormData();
        formData.append('data', blob, file.name);
        formData.append('encoding', options.encoding);

        var progress = new Z.progress({container: container});

        var callback = function (err, xhr) {
            progress.remove();
            if (err || xhr.status !== 200) {
                Z.addClass(container, 'has-error');
                console.error('Sorry, something went wrong…');
            } else {
                if (options.onSuccess) options.onSuccess(xhr.responseText)
            }
        };
        var onProgress = function (e) {
            if (e.lengthComputable) {
                var percentage = Math.round((e.loaded * 100) / e.total);
                progress.update(percentage);
            }
        }
        var onLoad = function () {
            progress.clear();
        }
        var xhr = Z.post({uri: options.uri, callback: callback, onProgress: onProgress, data: formData, onLoad: onLoad});

        if (options.onSubmit) options.onSubmit({form: formData});

        return false;
    };
    var processFile = function () {
        reader.readAsText(file, options.encoding || 'utf-8');
        holder.innerHTML = '<strong>' + file.name + '</strong> (or drag another file here, or <a id="browseLink" href="#">browse</a>)';
        listenBrowseLink();
    };
    var onFileDrop = function (e) {
        Z.removeClass(this, 'dragging');
        Z.stop(e);
        file = e.dataTransfer.files[0];
        processFile();
    };
    var onDragOver = function (e) {
        Z.stop(e);
        Z.addClass(this, 'dragging');
    };
    var onDragLeave = function (e) {
        Z.stop(e);
        Z.removeClass(this, 'dragging');
        return false;
    };
    var onDragEnter = function (e) {
        Z.stop(e);
    };
    var onFileLoad = function () {
        submitButton.disabled = false;
        blob = new Blob([reader.result], {type: (options.mimetype || 'text/csv') + '; charset=' + options.encoding || 'utf-8'});
        if (options.onFileLoad) options.onFileLoad({file: blob, headers: headers});
    };
    var onFileInputChange = function (e) {
        Z.stop(e);
        file = this.files[0];
        processFile();
    };
    var listenBrowseLink = function () {
        var browseLink = document.querySelector('#browseLink');
        var onBrowseLinkClick = function (e) {
            Z.stop(e);
            fileInput.click();
        };
        browseLink.addEventListener('click', onBrowseLinkClick, false);
    }; 
    listenBrowseLink();
    reader.addEventListener('load', onFileLoad, false);
    holder.addEventListener('dragenter', onDragEnter, false);
    holder.addEventListener('dragover', onDragOver, false);
    holder.addEventListener('dragleave', onDragLeave, false);
    holder.addEventListener('drop', onFileDrop, false);
    submitButton.addEventListener('click', onSubmit, false);
    fileInput.addEventListener('change', onFileInputChange, false);
};

Z.progress = function (options) {
    this.el = Z.el('progress', {}, options.container);
    this.el.max = options.max || 100;
};
Z.progress.prototype.update = function (value) {
    this.el.value = value || (this.el.value + 1) || 0;
};
Z.progress.prototype.remove = function () {
    this.el.parentNode.removeChild(this.el);
};
Z.progress.prototype.clear = function () {
    this.el.removeAttribute('value');  // Switch to undeterminate state.
};

// Suppression d'un élément dans un tableau
// et réinitialisation des clés à partir de 0

Z.reorgArray = function(arrayToUpdate) {
    var arrayUpdated = [];
    var keyUpdated = 0;

    for (var key = 0; key <= arrayToUpdate.length; key++) {
        if(arrayToUpdate[key]) {
            arrayUpdated[keyUpdated] = arrayToUpdate[key];
            keyUpdated++;
        }
    }
    return arrayUpdated;
};

/* Redéfinition de customEvent dans le cas de navigateurs qui ne le gèrent pas (ie) */

(function () {
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   };

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();



