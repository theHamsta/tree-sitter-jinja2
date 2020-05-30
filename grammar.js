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
block = $ => repeat($._block_statement)

module.exports = grammar ({
  name: 'jinja2',

  conflicts: $ => [
     // can be either an assignment or an block assignment
    [$.block_set_statement, $._statement],
    [$.for_statement],
  ],
    //

  rules: {
    source_file: $ => repeat($._block_statement),
    
    _block_statement: $ => choice($._statement, $.expression, $.line_statement, $.comment, $.text),

    for_statement: $ => seq($.startfor, block($), repeat(seq($.elif_statement, block($))), optional(seq($.else_statement, block($))), $.endfor),
    startfor: $ => seq('{%', whitespace_control, /\s*for\s*/, $.jinja_stuff,  whitespace_control, '%}'),
    endfor: $ => seq('{%', whitespace_control, /\s*endfor\s*/, whitespace_control, '%}'),

    if_statement: $ => seq($.startif, block($), repeat(seq($.elif_statement, block($))), optional(seq($.else_statement, block($))), $.endif),
    startif: $ => seq('{%', whitespace_control, /\s*if\s*/, $.jinja_stuff,  whitespace_control,'%}'),
    endif: $ => seq('{%', whitespace_control, /\s*endif\s*/, whitespace_control, '%}'),
    else_statement: $ => seq('{%', whitespace_control, /\s*else\s*/, whitespace_control,'%}'),
    elif_statement: $ => seq('{%', whitespace_control, /\s*elif\s*/, $.jinja_stuff, whitespace_control,'%}'),

    raw_statement: $ => seq($.startraw, $.rawtext, $.endraw),
    startraw: $ => seq('{%', whitespace_control, /\s*raw\s*/,  whitespace_control,'%}'),
    endraw: $ => seq('{%', whitespace_control, /\s*endraw\s*/, whitespace_control,'%}'),

    macro_statement: $ => seq($.startmacro, block($), $.endmacro),
    startmacro: $ => seq('{%', whitespace_control, /\s*macro\s*/, $.jinja_stuff,  whitespace_control,'%}'),
    endmacro: $ => seq('{%', whitespace_control, /\s*endmacro\s*/, whitespace_control,'%}'),

    extends_statement: $ => seq('{%', whitespace_control, /\s*extends\s*/,  $.jinja_stuff,  whitespace_control,'%}'),

    block_statement: $ => seq($.startblock, block($), $.endblock),
    startblock: $ => seq('{%', whitespace_control, /\s*block\s*/, $.jinja_stuff,  whitespace_control,'%}'),
    endblock: $ => seq('{%', whitespace_control, /\s*endblock\s*/, optional($.jinja_stuff), whitespace_control,'%}'),

    call_statement: $ => seq($.startcall, block($), $.endcall),
    startcall: $ => seq('{%', whitespace_control, /\s*call\s*/, $.jinja_stuff,  whitespace_control,'%}'),
    endcall: $ => seq('{%', whitespace_control, /\s*endcall\s*/, whitespace_control,'%}'),

    filter_statement: $ => seq($.startfilter, block($), $.endfilter),
    startfilter: $ => seq('{%', whitespace_control, /\s*filter\s*/, $.jinja_stuff,  whitespace_control,'%}'),
    endfilter: $ => seq('{%', whitespace_control, /\s*endfilter\s*/, whitespace_control,'%}'),

    block_set_statement: $ =>  seq($.set_statement, block($), $.endset),
    set_statement: $ => seq('{%', whitespace_control, /\s*set\s*/, $.jinja_stuff,  whitespace_control,'%}'),
    endset: $ => seq('{%', whitespace_control, /\s*endset\s*/, whitespace_control,'%}'),

    include_statement: $ => seq('{%', whitespace_control, /\s*include\s*/, $.jinja_stuff, whitespace_control,'%}'),
    import_statement: $ => seq('{%', whitespace_control, /\s*import\s*/, $.jinja_stuff, whitespace_control,'%}'),
    from_statement: $ => seq('{%', whitespace_control, /\s*from\s*/, $.jinja_stuff, whitespace_control,'%}'),

    autoescape_statement: $ => seq($.startautoescape, block($), $.endautoescape),
    startautoescape: $ => seq('{%', whitespace_control, /\s*autoescape\s*/, $.jinja_stuff,  whitespace_control,'%}'),
    endautoescape: $ => seq('{%', whitespace_control, /\s*endautoescape\s*/, whitespace_control,'%}'),

    trans_statement: $ => seq($.starttrans, block($), optional(seq($.pluralize, block($))), $.endtrans),
    starttrans: $ => seq('{%', whitespace_control, /\s*trans\s*/, $.jinja_stuff,  whitespace_control, '%}'),
    endtrans: $ => seq('{%', whitespace_control, /\s*endtrans\s*/, whitespace_control, '%}'),
    pluralize: $ => seq('{%', whitespace_control, /\s*pluralize\s*/, whitespace_control,'%}'),

    with_statement: $ => seq($.startwith, block($), $.endwith),
    startwith: $ => seq('{%', whitespace_control, /\s*with\s*/, $.jinja_stuff,  whitespace_control,'%}'),
    endwith: $ => seq('{%', whitespace_control, /\s*endwith\s*/, whitespace_control,'%}'),

    debug_statement: $ => seq('{%', whitespace_control, /\s*debug\s*/,  whitespace_control,'%}'),
    do_statement: $ => seq('{%', whitespace_control, /\s*do\s*/, $.jinja_stuff, whitespace_control,'%}'),

    expression: $ => seq('{{', whitespace_control, $.jinja_stuff, whitespace_control,'}}'),
    _statement: $ => choice($.for_statement,
                             $.if_statement,
                             $.raw_statement,
                             $.extends_statement,
                             $.macro_statement,
                             $.call_statement,
                             $.filter_statement,
                             $.set_statement,
                             $.block_set_statement,
                             $.include_statement,
                             $.import_statement,
                             $.from_statement,
                             $.autoescape_statement,
                             $.with_statement,
                             $.debug_statement,
                             $.do_statement,
                             $.trans_statement,
                             $.block_statement
                             ),

    line_statement: $ => prec(3, seq('^#', $.jinja_stuff, optional('##'))),
    comment: $ => seq('{#', $.rawtext, '#}'),

    _text: $ =>  choice(/[^{}%#]+/, '{', '}', '#', '%'),
    _rawtext: $ =>  choice($._text, '{{', '}}', '{%', '%}', '{#', '#}'),

    jinja_stuff: $ =>  prec.left(2, repeat1($._text)),
    text: $ =>  prec.left(2, repeat1($._text)),
    rawtext: $ => prec.left(2, repeat1($._rawtext)), 
 
  }
});
