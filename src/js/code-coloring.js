import {parseCode} from './code-analyzer';

var function_dictionary = {
    'FunctionDeclaration' : function_declaration_hendler,
    'BlockStatement' : block_statement_hendler,
    'VariableDeclaration' : variable_declaration_hendler,
    'VariableDeclarator': variable_declarator_hendler,
    'ExpressionStatement' : expression_statement_hendler,
    'AssignmentExpression' : assignment_expression_hendler,
    'WhileStatement' : while_statement_hendler,
    'IfStatement' : if_else_if_statement_hendler,
    'elseIfStatement' : if_else_if_statement_hendler,
    'ReturnStatement' : return_statement_hendler
};

var expression_dictionary = {
    'Literal' : literal_expression,
    'Identifier' : identifier_expression,
    'MemberExpression' : member_expression,
    'UnaryExpression' : unary_expression,
    'UpdateExpression' : update_expression
};

var arg_dict = [];
var variable_dict = [];
var global_dict = [];
var func_start = false;
var cond_dict = [];

var variable_lines = [];
var arg_lines = [];
var block_num = 0;

var input_vector;

var statemens_lines = [];

var statemens_cond = true;

var boundry_dict = [];

function variable_exist(v_name, dict){
    for(var i=0;i<dict.length;i++) {
        if (dict[i].name == v_name) {
            return i;
        }
    }
    return -1;
}

function init_arg_dict(args){
    for(var i=0;i<args.length;i++){
        var val;
        if(input_vector !== null){
            val = input_vector[i];
        }
        else{
            val = args[i].name;
        }
        arg_dict.push({
            name: args[i].name,
            val_obj: val
        });
    }
}

function symbolic_substitutio(codeToParse){
    init_all_globals();
    func_start = false;
    arg_dict = [];
    let parsed_code = parseCode(codeToParse);
    parsed_code.body.forEach(function(element){
        recursiveBuilding(element);
    });
    switch_blocks();
    return [parsed_code,boundry_dict];
}

function color_code(code, input_vec){
    init_all_globals();
    input_vector = input_vec;
    let parsed_code = parseCode(code);
    parsed_code.body.forEach(function(element){
        recursiveBuilding(element);
    });
    switch_blocks();
    return statemens_lines;
}

function init_all_globals(){
    arg_dict = [];
    variable_dict = [];
    variable_lines = [];
    arg_lines = [];
    block_num = 0;
    input_vector = null;
    statemens_lines = [];
    cond_dict = [];
    statemens_cond = true;
    boundry_dict = [];
}

function recursiveBuilding(obj){
    let obj_type =  obj.type;
    if(obj_type in function_dictionary){
        return function_dictionary[obj_type](obj);
    }
}

function function_declaration_hendler(obj){
    func_start = true;
    init_arg_dict(obj.params);
    insert_to_block(obj);
    recursiveBuilding(obj.body);
    out_from_block();
}

function generate_member(val){
    let arr = get_value(val.left.name).val_obj;
    if(val.len){
        return arr.length;
    }
    let idx = generate_value(val.right);
    idx = eval(idx);
    return arr[idx];
}

function concat_left_right(val, val_left, val_right){
    if(val.oper == 'member'){
        if(val.len){
            return val_left + '.length';
        }
        return val_left + '[' + val_right + ']';
    }
    return val_left + ' ' + val.oper + ' ' + val_right;
}

function generate_obj(val){
    if(typeof val.name === 'undefined'){
        let val_left = surround(generate_value(val.left));
        let val_right = surround(generate_value(val.right));
        return concat_left_right(val, val_left, val_right);
    }
    let current_val = get_value(val.name);
    if(typeof current_val !== 'object'){
        return current_val;
    }
    return generate_value(current_val.val_obj);
}

function generate_value(val){
    if(val == null || typeof val !== 'object'){
        return val;
    }
    if(val.oper == 'member' && input_vector !== null){
        return generate_member(val);
    }
    return generate_obj(val);
}

function get_value(name){
    let idx = variable_exist(name, variable_dict);
    if(idx >= 0){
        return variable_dict[idx];
    }
    if(input_vector !== null){
        let idx = variable_exist(name, arg_dict);
        if(idx < 0){
            idx = variable_exist(name, global_dict);
        }
        return arg_dict[idx];
    }
    return name;
}

function insert_global(name, val_obj){
    if(!func_start){
        global_dict.push({
            name: name,
            val_obj: val_obj
        });
        return true;
    }
    let idx = variable_exist(name, global_dict);
    if(idx > -1){
        let old_value = global_dict[idx].val_obj;
        cheack_childs(name, old_value, val_obj);
        global_dict[idx].val_obj = val_obj;
        return true;
    }
    return false;
}

function insert_variable(name, val_obj){
    if(insert_global(name, val_obj)){return;}
    let idx = variable_exist(name, arg_dict);
    if(idx>-1){
        let old_value = arg_dict[idx].val_obj;
        cheack_childs(name, old_value, val_obj);
        arg_dict[idx].val_obj = val_obj;
        return;
    }
    idx = variable_exist(name, variable_dict);
    if(idx>-1){
        let old_value = variable_dict[idx].val_obj;
        cheack_childs(name, old_value, val_obj);
        variable_dict[idx].val_obj = val_obj;
        return;
    }
    variable_dict.push({name: name,val_obj: val_obj});
}

function cheack_obj_child(name, old_value, new_value){
    if(typeof new_value.name == 'undefined'){
        let left_val = cheack_childs(name, old_value, new_value.left);
        if(left_val !== null){
            new_value.left = left_val;
        }
        let right_val = cheack_childs(name, old_value, new_value.right);
        if(right_val !== null){
            new_value.right = right_val;
        }
    }
    return null;
}

function cheack_childs(name, old_value, new_value){
    if(typeof new_value !== 'object'){
        return null;
    }
    if(new_value.name == name){
        return old_value;
    }
    return cheack_obj_child(name, old_value, new_value);
}

function variable_declarator_hendler(obj){
    insert_variable(obj.id.name, parseExpression(obj.init));
}

function assignment_expression_hendler(obj){
    let name = obj.left.name;
    let val_obj = parseExpression(obj.right);
    insert_variable(name, val_obj);
    let value  = generate_value(val_obj);
    obj.right = create_identifier(value, obj.right.loc);
}

function create_identifier(name, loc){
    let id = {
        type: 'Identifier',
        name: name,
        loc: loc
    };
    return id;
}

function color_while(obj){
    if(input_vector !== null){
        let cond = false;
        if(statemens_cond){
            cond = get_condition(obj);
            cond = evaluate(cond);
            cond_dict[block_num] = cond;
            statemens_cond = cond;
        }
        statemens_lines.push({
            line: obj.test.loc.start.line,
            cond: cond,
            type: 'while'
        });
    }
}

function while_statement_hendler(obj){
    insert_to_block(obj);
    obj = update_test(obj);
    color_while(obj);
    recursiveBuilding(obj.body);
    out_from_block();
}

function evaluate(exp){
    var str = 'var x; if(' + exp + '){x= true;}else{x=false;}';
    let bool = eval(str);
    return bool;
}

function expression_statement_hendler(obj){
    recursiveBuilding(obj.expression);
}

function insert_to_block(obj){
    cond_dict[block_num] = statemens_cond;
    variable_lines[block_num]=JSON.parse(JSON.stringify(variable_dict));
    arg_lines[block_num]=JSON.parse(JSON.stringify(arg_dict)); 
    block_num++;

    boundry_dict.push({
        start: obj.loc.start.line,
        end: obj.loc.end.line
    });
}

function out_from_block(){
    if(input_vector !== null){
        statemens_cond = cond_dict[block_num-1];
    }
    block_num--;
    variable_dict = JSON.parse(JSON.stringify(variable_lines[block_num]));
    arg_dict = JSON.parse(JSON.stringify(arg_lines[block_num]));
}

function switch_blocks(){
    variable_lines[block_num]=JSON.parse(JSON.stringify(variable_dict));
    arg_lines[block_num]=JSON.parse(JSON.stringify(arg_dict));

    block_num++;

    variable_dict = JSON.parse(JSON.stringify(variable_lines[0]));
    arg_dict = JSON.parse(JSON.stringify(arg_lines[0]));
}

function get_condition(obj){
    if(typeof obj.test.operator === 'undefined'){
        return obj.test.name;
    }
    else{
        return obj.test.left.name + ' ' + obj.test.operator + ' ' + obj.test.right.name;
    }
}

function color_if(obj){
    let cond = false;
    if(!obj.test.true && statemens_cond){
        cond = get_condition(obj);
        cond = evaluate(cond);
        cond_dict[block_num] = cond;
        statemens_cond = cond;
    }
    statemens_lines.push({
        line: obj.test.loc.start.line,
        cond: cond,
        type: 'if'
    });
    if(obj.alternate !== null && obj.alternate.type === 'IfStatement'){
        obj.alternate.test.true = cond;
    }
}

function update_test(obj){
    if(typeof obj.test.operator === 'undefined'){
        obj.test.name = generate_value(parseExpression(obj.test));
    }
    else{
        obj.test.left = create_identifier(generate_value(parseExpression(obj.test.left)), obj.test.left.loc);
        obj.test.right = create_identifier(generate_value(parseExpression(obj.test.right)), obj.test.right.loc);
    }
    return obj;
}

function if_else_if_statement_hendler(obj){
    insert_to_block(obj);
    obj = update_test(obj);
    if(input_vector !== null){
        color_if(obj);
    }
    recursiveBuilding(obj.consequent);
    out_from_block();
    if(obj.alternate !== null){
        if(obj.alternate.type !== 'IfStatement'){
            insert_to_block(obj.alternate);
            recursiveBuilding(obj.alternate);
            out_from_block();
        }
        recursiveBuilding(obj.alternate);
    }
}

function return_statement_hendler(obj){
    let name = generate_value(parseExpression(obj.argument));
    let loc = obj.argument.loc;
    obj.argument = create_identifier(name, loc);
}

function variable_declaration_hendler(obj){
    obj.body = call_all_childes(obj.declarations);
}

function block_statement_hendler(obj){
    obj.body = call_all_childes(obj.body);
}

function call_all_childes(childes){
    let new_chileds = [];
    childes.forEach(function(element){
        recursiveBuilding(element);
        new_chileds.push(element);
    });
    return new_chileds;
}

function parseExpression(obj){
    var val_obj;
    if(!(obj.type in expression_dictionary)){
        let left_val_obj = parseExpression(obj.left);
        let right_val_obj = parseExpression(obj.right);
        val_obj = {
            left: left_val_obj,
            right: right_val_obj,
            oper: obj.operator
        };
    }
    else{
        val_obj = expression_dictionary[obj.type](obj);
    } 
    return val_obj;
}

function surround(exp){
    if(exp.length !== 'undefined' && exp.length > 1 && exp == 'length'){
        return '(' + exp + ')';
    }
    return exp;
}

function literal_expression(obj){
    return obj.raw;
}

function identifier_expression(obj){
    let val = {
        name: obj.name,
        val_obj: obj.name
    };
    return val;
}

function member_expression(obj){
    let arr_obj = parseExpression(obj.object);
    let prop_obj = parseExpression(obj.property);
    if(input_vector == null){
        obj.object = create_identifier(generate_value(arr_obj), obj.object.loc);
        obj.property = create_identifier(generate_value(prop_obj), obj.property.loc);
    }
    let val_obj = {
        left: arr_obj,
        right: prop_obj,
        oper: 'member'
    };
    if(!obj.computed){
        val_obj.len = true;
    }
    return  val_obj;
}

function unary_expression(obj){
    let right_val_obj = parseExpression(obj.argument);
    let val_obj = {
        left: '',
        right: right_val_obj,
        oper: obj.operator
    };
    return val_obj;
}

function update_expression(obj){
    let arg_obj = parseExpression(obj.argument);
    let val_obj = {};
    if(obj.prefix) {
        val_obj = {
            left: '',
            right: arg_obj,
            oper: obj.operator
        };
    }    
    else {
        val_obj = {
            left: arg_obj,
            right: '',
            oper: obj.operator
        };
    }
    return val_obj;
}

export {symbolic_substitutio,color_code}; 