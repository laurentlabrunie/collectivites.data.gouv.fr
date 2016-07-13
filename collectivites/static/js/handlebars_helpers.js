Handlebars.registerHelper('if_eq', function(a, b, opts) {
    if (a == b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});

Handlebars.registerHelper('if_sup', function(a, b, opts) {
    if (a > b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});

Handlebars.registerHelper('if_diff', function(a, b, opts) {
    if (a != b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});