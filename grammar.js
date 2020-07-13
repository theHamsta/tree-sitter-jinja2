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

var maybe_whitespace_control = $ => optional($.whitespace_control)
var block = $ => repeat($._block_statement)

module.exports = grammar ({
  name: 'jinja2',

  conflicts: $ => [
     // can be either an assignment or an block assignment
    [$.block_set_statement, $.jinja_scope],
    [$.for_statement],
  ],
    //

  rules: {
    source_file: $ => repeat($._block_statement),
    
    _block_statement: $ => choice($.jinja_scope, $.expression, $.line_statement, $.comment, $.text),
    white_space_control: $ => choice($.jinja_scope, $.expression, $.line_statement, $.comment, $.text),

    for_statement: $ => seq($.startfor, block($), repeat(seq($.elif_statement, block($))), optional(seq($.else_statement, block($))), $.endfor),
    startfor: $ => seq('{%', maybe_whitespace_control($), /\s*for\s*/, $.jinja_stuff,  maybe_whitespace_control($), '%}'),
    endfor: $ => seq('{%', maybe_whitespace_control($), /\s*endfor\s*/, maybe_whitespace_control($), '%}'),

    if_statement: $ => seq($.startif, block($), repeat(seq($.elif_statement, block($))), optional(seq($.else_statement, block($))), $.endif),
    startif: $ => seq('{%', maybe_whitespace_control($), /\s*if\s*/, $.jinja_stuff,  maybe_whitespace_control($),'%}'),
    endif: $ => seq('{%', maybe_whitespace_control($), /\s*endif\s*/, maybe_whitespace_control($), '%}'),
    else_statement: $ => seq('{%', maybe_whitespace_control($), /\s*else\s*/, maybe_whitespace_control($),'%}'),
    elif_statement: $ => seq('{%', maybe_whitespace_control($), /\s*elif\s*/, $.jinja_stuff, maybe_whitespace_control($),'%}'),

    raw_statement: $ => seq($.startraw, $.rawtext, $.endraw),
    startraw: $ => seq('{%', maybe_whitespace_control($), /\s*raw\s*/,  maybe_whitespace_control($),'%}'),
    endraw: $ => seq('{%', maybe_whitespace_control($), /\s*endraw\s*/, maybe_whitespace_control($),'%}'),

    macro_statement: $ => seq($.startmacro, block($), $.endmacro),
    startmacro: $ => seq('{%', maybe_whitespace_control($), /\s*macro\s*/, $.jinja_stuff,  maybe_whitespace_control($),'%}'),
    endmacro: $ => seq('{%', maybe_whitespace_control($), /\s*endmacro\s*/, maybe_whitespace_control($),'%}'),

    extends_statement: $ => seq('{%', maybe_whitespace_control($), /\s*extends\s*/,  $.jinja_stuff,  maybe_whitespace_control($),'%}'),

    block_statement: $ => seq($.startblock, block($), $.endblock),
    startblock: $ => seq('{%', maybe_whitespace_control($), /\s*block\s*/, $.jinja_stuff,  maybe_whitespace_control($),'%}'),
    endblock: $ => seq('{%', maybe_whitespace_control($), /\s*endblock\s*/, optional($.jinja_stuff), maybe_whitespace_control($),'%}'),

    call_statement: $ => seq($.startcall, block($), $.endcall),
    startcall: $ => seq('{%', maybe_whitespace_control($), /\s*call\s*/, $.jinja_stuff,  maybe_whitespace_control($),'%}'),
    endcall: $ => seq('{%', maybe_whitespace_control($), /\s*endcall\s*/, maybe_whitespace_control($),'%}'),

    filter_statement: $ => seq($.startfilter, block($), $.endfilter),
    startfilter: $ => seq('{%', maybe_whitespace_control($), /\s*filter\s*/, $.jinja_stuff,  maybe_whitespace_control($),'%}'),
    endfilter: $ => seq('{%', maybe_whitespace_control($), /\s*endfilter\s*/, maybe_whitespace_control($),'%}'),

    block_set_statement: $ =>  seq($.set_statement, block($), $.endset),
    set_statement: $ => seq('{%', maybe_whitespace_control($), /\s*set\s*/, $.jinja_stuff,  maybe_whitespace_control($),'%}'),
    endset: $ => seq('{%', maybe_whitespace_control($), /\s*endset\s*/, maybe_whitespace_control($),'%}'),

    include_statement: $ => seq('{%', maybe_whitespace_control($), /\s*include\s*/, $.jinja_stuff, maybe_whitespace_control($),'%}'),
    import_statement: $ => seq('{%', maybe_whitespace_control($), /\s*import\s*/, $.jinja_stuff, maybe_whitespace_control($),'%}'),
    from_statement: $ => seq('{%', maybe_whitespace_control($), /\s*from\s*/, $.jinja_stuff, maybe_whitespace_control($),'%}'),

    autoescape_statement: $ => seq($.startautoescape, block($), $.endautoescape),
    startautoescape: $ => seq('{%', maybe_whitespace_control($), /\s*autoescape\s*/, $.jinja_stuff,  maybe_whitespace_control($),'%}'),
    endautoescape: $ => seq('{%', maybe_whitespace_control($), /\s*endautoescape\s*/, maybe_whitespace_control($),'%}'),

    trans_statement: $ => seq($.starttrans, block($), optional(seq($.pluralize, block($))), $.endtrans),
    starttrans: $ => seq('{%', maybe_whitespace_control($), /\s*trans\s*/, $.jinja_stuff,  maybe_whitespace_control($), '%}'),
    endtrans: $ => seq('{%', maybe_whitespace_control($), /\s*endtrans\s*/, maybe_whitespace_control($), '%}'),
    pluralize: $ => seq('{%', maybe_whitespace_control($), /\s*pluralize\s*/, maybe_whitespace_control($),'%}'),

    with_statement: $ => seq($.startwith, block($), $.endwith),
    startwith: $ => seq('{%', maybe_whitespace_control($), /\s*with\s*/, $.jinja_stuff,  maybe_whitespace_control($),'%}'),
    endwith: $ => seq('{%', maybe_whitespace_control($), /\s*endwith\s*/, maybe_whitespace_control($),'%}'),

    debug_statement: $ => seq('{%', maybe_whitespace_control($), /\s*debug\s*/,  maybe_whitespace_control($),'%}'),
    do_statement: $ => seq('{%', maybe_whitespace_control($), /\s*do\s*/, $.jinja_stuff, maybe_whitespace_control($),'%}'),

    expression: $ => seq('{{', maybe_whitespace_control($), $.jinja_stuff, maybe_whitespace_control($),'}}'),
    jinja_scope: $ => choice($.for_statement,
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

    //_text: $ =>  choice(/[^{}%#]+/, '{', '}', '#', '%'),
    _rawtext: $ =>  choice($._text, '{{', '}}', '{%', '%}', '{#', '#}'),

    jinja_stuff: $ =>  prec.left(2, repeat1($._text)),
    text: $ =>  prec.left(2, repeat1($._text)),
    rawtext: $ => prec.left(2, repeat1($._rawtext)), 
 
  }
});
