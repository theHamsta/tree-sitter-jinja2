/*
 * grammar.js
 * Copyright (C) 2020 Stephan Seitz <stephan.seitz@fau.de>
 *
 * Distributed under terms of the GPLv3 license.
 */



    //{% ... %} for Statements

    //{{ ... }} for Expressions to print to the template output

    //{# ... #} for Comments not included in the template output

    //#  ... ## for Line Statements

//valid:

//{%- if foo -%}...{% endif %}

//invalid:

//{% - if foo - %}...{% endif %}

whitespace_control = /-?\+?/

module.exports = grammar ({
  name: 'jinja2',

  conflicts: $ => [
     // can be either an assignment or an block assignment
    [$.block_set_statement, $._statement],
  ],

  rules: {
    source_file: $ => repeat($._block),

    _block: $ => choice($._statement, $.expression, $.line_statement, $.comment, $.text),

    for_statement: $ => seq($.startfor, repeat($._block), repeat(seq($.elif_statement, $._block)), optional(seq($.else_statement, $._block)), $.endfor),
    startfor: $ => seq('{%', whitespace_control, /\s*for\s*/, $.jinja_stuff,  whitespace_control, '%}'),
    endfor: $ => seq('{%', whitespace_control, /\s*endfor\s*/, whitespace_control, '%}'),

    if_statement: $ => seq($.startif, repeat($._block), repeat(seq($.elif_statement, $._block)), optional(seq($.else_statement, $._block)), $.endif),
    startif: $ => seq('{%', whitespace_control, /\s*if\s*/, $.jinja_stuff,  whitespace_control,'%}'),
    endif: $ => seq('{%', whitespace_control, /\s*endif\s*/, whitespace_control, '%}'),
    else_statement: $ => seq('{%', whitespace_control, /\s*else\s*/, whitespace_control,'%}'),
    elif_statement: $ => seq('{%', whitespace_control, /\s*elif\s*/, $.jinja_stuff, whitespace_control,'%}'),

    raw_statement: $ => seq($.startraw, $.rawtext, $.endraw),
    startraw: $ => seq('{%', whitespace_control, /\s*raw\s*/,  whitespace_control,'%}'),
    endraw: $ => seq('{%', whitespace_control, /\s*endraw\s*/, whitespace_control,'%}'),

    macro_statement: $ => seq($.startmacro, $._block, $.endmacro),
    startmacro: $ => seq('{%', whitespace_control, /\s*macro\s*/, $.jinja_stuff,  whitespace_control,'%}'),
    endmacro: $ => seq('{%', whitespace_control, /\s*endmacro\s*/, whitespace_control,'%}'),

    extends_statement: $ => seq('{%', whitespace_control, /\s*extends\s*/,  $.jinja_stuff,  whitespace_control,'%}'),

    block_statement: $ => seq($.startblock, $._block, $.endblock),
    startblock: $ => seq('{%', whitespace_control, /\s*block\s*/, $.jinja_stuff,  whitespace_control,'%}'),
    endblock: $ => seq('{%', whitespace_control, /\s*endblock\s*/, optional($.jinja_stuff), whitespace_control,'%}'),

    call_statement: $ => seq($.startcall, $._block, $.endcall),
    startcall: $ => seq('{%', whitespace_control, /\s*call\s*/, $.jinja_stuff,  whitespace_control,'%}'),
    endcall: $ => seq('{%', whitespace_control, /\s*endcall\s*/, whitespace_control,'%}'),

    filter_statement: $ => seq($.startfilter, $._block, $.endfilter),
    startfilter: $ => seq('{%', whitespace_control, /\s*filter\s*/, $.jinja_stuff,  whitespace_control,'%}'),
    endfilter: $ => seq('{%', whitespace_control, /\s*endfilter\s*/, whitespace_control,'%}'),

    block_set_statement: $ =>  seq($.set_statement, $._block, $.endset),
    set_statement: $ => seq('{%', whitespace_control, /\s*set\s*/, $.jinja_stuff,  whitespace_control,'%}'),
    endset: $ => seq('{%', whitespace_control, /\s*endset\s*/, whitespace_control,'%}'),

    include_statement: $ => seq('{%', whitespace_control, /\s*include\s*/, $.jinja_stuff, whitespace_control,'%}'),
    import_statement: $ => seq('{%', whitespace_control, /\s*import\s*/, $.jinja_stuff, whitespace_control,'%}'),
    from_statement: $ => seq('{%', whitespace_control, /\s*from\s*/, $.jinja_stuff, whitespace_control,'%}'),

    expression: $ => seq('{{', whitespace_control, $.jinja_stuff, whitespace_control,'}}'),
    _statement: $ => choice($.for_statement,
                             $.if_statement,
                             $.raw_statement,
                             $.extends_statement,
                             $.macro_statement,
                             $.call_statement,
                             $.filter_statement,
                             $.block_set_statement,
                             $.set_statement,
                             $.include_statement,
                             $.import_statement,
                             $.from_statement,
                             $.block_statement),

    line_statement: $ => prec(3, seq('^#', $.jinja_stuff, optional('##'))),
    comment: $ => seq('{#', $.rawtext, '#}'),

    _text: $ =>  choice(/[^{}%#]+/, '{', '}', '#', '%'),
    _rawtext: $ =>  choice($._text, '{{', '}}', '{%', '%}', '{#', '#}'),

    jinja_stuff: $ =>  prec.left(2, repeat1($._text)),
    text: $ =>  prec.left(2, repeat1($._text)),
    rawtext: $ => prec.left(2, repeat1($._rawtext)), 
 
  }
});
