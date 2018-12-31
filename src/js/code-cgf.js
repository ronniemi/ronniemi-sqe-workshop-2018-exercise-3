import * as esgraph from 'esgraph';
import * as esprima from 'esprima';

function create_cfg(code, boundry_table, color_table){
    console.log(code);
    console.log(JSON.stringify(boundry_table,null,0))
    console.log(JSON.stringify(color_table,null,0))

    let parsed_code_val = esprima.parse(code, { range: true });

    let val_nodes_edgs = get_dot_node_edg(parsed_code_val, code);

    val_nodes_edgs[0] = get_lines_number(code, val_nodes_edgs[0], color_table);
    var block_nodes = create_blocked_cfg(val_nodes_edgs, boundry_table);

    return block_nodes;
}

function get_lines_number(code, nodes_list, color_table){
    let lines = code.split('\n');
    let lines_idx = 0;
    let idx_list = [];
    for(var i=0;i<lines.length;i++){
        let element = lines[i];
        let match_node_idx;
        match_node_idx = metching_node_to_line(element, lines_idx, nodes_list, idx_list, color_table);        
        if(match_node_idx >= 0){
            idx_list.push(match_node_idx);
        }
        lines_idx++;
    }
    return nodes_list;
}

function metching_node_to_line(line_val, line_idx, nodes_list, idx_list,color_table){
    let match_node_idx = -1;
    for(var i=0;i<nodes_list.length;i++){
        let element = nodes_list[i];
        if(!idx_list.includes(element.node) && line_val.indexOf(element.lable) > 0){
            element.line_number = line_idx;
            get_codition_to_node(element, color_table);
            match_node_idx = element.node;
            break;
        }
    }
    return match_node_idx;    
}

function get_codition_to_node(node, color_table){
    for(var i=0;i<color_table.length;i++){
        let element = color_table[i];
        if(element.line === node.line_number){
            if(element.cond){
                node.is_in_true_path = 1;
                node.type = element.type;
            }
            else{
                node.is_in_true_path = -1;
                node.type = element.type;
            }
        }
    }
    if(!node.is_in_true_path){
        node.is_in_true_path = 0;
    }
}

function get_dot_node_edg(parsed_code, original_code){
    var cfg = esgraph(parsed_code.body[0].body);
    var dot = esgraph.dot(cfg, { counter: 1, source: original_code});
    var nodes_edgs = create_nodes_edgs_json(dot);
    return nodes_edgs;
}

function create_nodes_edgs_json(dot){
    let nodes_edgs = split_to_nodes_eadges(dot);
    let nodes_list = nodes_edgs[0];
    let edg_list = nodes_edgs[1];
    let json_nodes = [];
    let json_edg = [];
    for(var i=0;i<nodes_list.length;i++){
        let element = nodes_list[i];
        json_nodes.push(node_to_json(element));
    }
    for(var i=0;i<edg_list.length;i++){
        let element = edg_list[i];
        json_edg.push(edge_to_json(element));
    }
    return [json_nodes, json_edg];
}

function split_to_nodes_eadges(dot){
    let rows = dot.split('\n');
    let nodes_list = [];
    let edg_list = [];
    for(var i=0;i<rows.length;i++){
        let element = rows[i];
        if(element.length > 0){
            if(element.indexOf('->') < 0){
                nodes_list.push(element);
            }
            else{
                edg_list.push(element);
            }
        }
    }
    return [edit_nodes_list(nodes_list), edit_eadgs_list(edg_list)];
}

function edit_nodes_list(nodes_list){
    let new_nodes_list = [];
    for(var i=0;i<nodes_list.length;i++){
        let element = nodes_list[i];
        if(element.indexOf('label="entry"') < 0 && element.indexOf('label="exit"') < 0){
            new_nodes_list.push(element);
        }
    }
    return new_nodes_list;
}

function edit_eadgs_list(edg_list){
    let new_edg_list = [];
    for(var i=0;i<edg_list.length;i++){
        let element = edg_list[i];
        if(element.indexOf('exception') < 0){
            new_edg_list.push(element);
        }
    }
    return new_edg_list;
}

function node_to_json(node){
    let idx = node.indexOf('[');
    let node_idx = node.substring(1,idx-1);
    let start = node.indexOf('"');
    let end = node.lastIndexOf(']');
    node = node.substring(start+1, end-1);
    return {
        node: node_idx,
        lable: node
    };
}

function edge_to_json(edge){
    let idx_1 = edge.indexOf('-');
    let idx_2 = edge.indexOf('[');
    let idx_3 = edge.indexOf('>') + 3;
    let from_node_idx = edge.substring(1,idx_1-1);
    let to_node_idx = edge.substring(idx_3,idx_2-1);
    let cond = '';
    if(edge.indexOf('true') > 0){
        cond = true;
    }
    else if(edge.indexOf('false') > 0){
        cond = false;
    }
    return{
        from_node: from_node_idx,
        to_node: to_node_idx,
        cond: cond
    };
}

function create_blocked_cfg(nodes_edg_val, boundry_table){
    boundry_table = edit_boundry_table(boundry_table);
    let new_nodes = [];
    let start_bnoundry;
    let end_boundry;
    for(var i=0;i<boundry_table.length;i++){
        let element = boundry_table[i];
        start_bnoundry = element.start;
        end_boundry = element.end;
        let new_block_node = get_block(nodes_edg_val[0], start_bnoundry, end_boundry, nodes_edg_val[1]);
        if(new_block_node.lable.length > 0){
            new_block_node.cond = element.cond;
            new_nodes.push(new_block_node);
        }
    }
    nodes_edg_val[0] = new_nodes;
    nodes_edg_val[1] = remove_edgs(new_nodes, nodes_edg_val[1]);
    color_nodes(nodes_edg_val);
    return node_edg_to_dot(nodes_edg_val);
}

function color_nodes(nodes_edg_val){
    let nodes = nodes_edg_val[0];
    let node = nodes[0];
    if(node.is_in_true_path >= 0){
        color_node(node, nodes_edg_val);
    }
}

function color_node(node, nodes_edg_val){
    let next_node = get_next(node, nodes_edg_val);
    next_node = get_node_by_idx(next_node, nodes_edg_val[0]);
    node.color = 'green';
    if(next_node === -1){
        return;
    }
    color_node(next_node, nodes_edg_val);
}

function get_node_by_idx(node_idx, nodes_list){
    let node = -1;
    for(var i=0;i<nodes_list.length;i++){
        let element = nodes_list[i];
        if(element.node_idx == node_idx){
            node = element;
        }
    }
    return node;
}

function get_next(node, nodes_edgs){
    let next_node;
    if(node.cond){
        next_node = get_next_node_after_cond(node, nodes_edgs);
    }
    else{
        next_node = get_next_node(node, nodes_edgs);
    }
    return next_node;
}

function get_node_condition(node){
    if(node.is_in_true_path > 0){
        return true;
    }
    else{
        return false;
    }
}

function get_next_node_after_cond(node, nodes_edgs){
    if(node.type === 'while' && node.color === 'green'){
        let true_false_nodes = get_true_false_nodes(node, nodes_edgs);
        if(get_node_condition(node)){
            return true_false_nodes[1];
        }
        else{
            return true_false_nodes[0];
        }
    }
    return menage_condition(node, nodes_edgs);
}

function get_true_false_nodes(node, nodes_edgs){
    let true_node;
    let false_node;
    for(var i=0;i<nodes_edgs[1].length;i++){
        let element = nodes_edgs[1][i];
        if(element.from_node == node.node_idx){
            if(element.cond){
                true_node = element.to_node;
            }
            else{
                false_node = element.to_node;
            }
        }
    }
    return [true_node, false_node];
}

function menage_condition(node, nodes_edgs){
    let true_false_nodes = get_true_false_nodes(node, nodes_edgs);
    let node_cond = get_node_condition(node);
    if(node_cond){
        return true_false_nodes[0];
    }
    else{
        return true_false_nodes[1];   
    }
}

function get_next_node(node, nodes_edgs){
    let next_node = -1;
    for(var i=0;i<nodes_edgs[1].length;i++){
        let element = nodes_edgs[1][i];
        if(element.from_node == node.node_idx){
            next_node = element.to_node;
        }
    }
    return next_node;
}

function node_edg_to_dot(nodes_edg_val){
    let new_dot = [];
    for(var i=0;i<nodes_edg_val[0].length;i++){
        let element = nodes_edg_val[0][i];
        let color = fill_color(element.color);
        let shape = 'square';
        if(element.cond){
            shape = 'diamond';
        }
        let line = 'n' + element.node_idx + ' [xlabel=' + element.line_number + 'label="' + element.lable + '", shape="' + shape + '", fillcolor="' + color + ']';
        new_dot.push(line);
    }
    for(var i=0;i<nodes_edg_val[1].length;i++){
        let element = nodes_edg_val[1][i];
        let line = 'n' + element.from_node + ' -> n' + element.to_node + ' [label="' + element.cond + '"]';
        new_dot.push(line);
    }
    return new_dot.join('\n');
}

function fill_color(color){
    if(color === 'green'){
        return '#89E9AF", style=filled';
    }
    return 'black"';
}

function remove_edgs(new_nodes, edg_list){
    let new_node_idx = [];
    let new_edg_list = [];
    for(var i=0;i<new_nodes.length;i++){
        let element = new_nodes[i];
        new_node_idx.push(element.node_idx);
    }
    for(var i=0;i<edg_list.length;i++){
        let element = edg_list[i];
        let node_1 = element.from_node;
        let node_2 = element.to_node;
        if((new_node_idx.includes(node_1) && new_node_idx.includes(node_2)) && node_1 !== node_2){
            new_edg_list.push(element);
        }
    }
    return new_edg_list;
}

function get_block(nodes_val, start_bnoundry, end_boundry, edg_list){
    let new_lable = [];
    let new_node_idx = [];
    let is_in_true_path;
    let type = 'reguler';
    for(var i=0;i<nodes_val.length;i++){
        let element = nodes_val[i];
        if(element.line_number >= start_bnoundry && element.line_number < end_boundry){
            new_lable.push(element.lable);
            new_node_idx.push(element.node);
            is_in_true_path = element.is_in_true_path;
            if(typeof element.type !== 'undefined'){
                type = element.type;
            }
        }
    }
    replce_edgs_noseds_name(edg_list, new_node_idx[0] ,new_node_idx);
    return {lable: new_lable.join('\n'),node_idx: new_node_idx[0],is_in_true_path: is_in_true_path, type: type,line_number: start_bnoundry};
}

function replce_edgs_noseds_name(edg_list, new_node_idx, node_list){
    for(var i=0;i<edg_list.length;i++){
        let element = edg_list[i];
        let node_1 = element.from_node;
        let node_2 = element.to_node;
        if(node_list.includes(node_1)){
            element.from_node = new_node_idx;
        }
        if(node_list.includes(node_2)){
            element.to_node = new_node_idx;
        }
    }
}

function edit_boundry_table(boundry_table){
    let idx = 0;
    let new_boundry = [];
    boundry_table = remove_duplicate_boundry(boundry_table);
    for(var i=0;i<boundry_table.length;i++){
        let element = boundry_table[i];
        if(idx !== 0){
            new_boundry.push({start: boundry_table[idx].start-1,end: boundry_table[idx].start,cond: true});
        }
        if(idx != boundry_table.length-1){
            element.end = boundry_table[idx+1].start-1;
            element.cond = false;
        }
        else{
            element.cond = false;}
        idx++;
    }
    boundry_table.push({start:boundry_table[idx-1].end,end: Number.MAX_SAFE_INTEGER,cond: false});
    Array.prototype.push.apply(boundry_table,new_boundry);
    return boundry_table;
}

function remove_duplicate_boundry(boundry_table){
    let boundry_starts = [];
    let new_boundry = [];
    for(var i=0;i<boundry_table.length;i++){
        let element = boundry_table[i];
        if(!boundry_starts.includes(element.start)){
            boundry_starts.push(element.start);
            new_boundry.push(element);
        }
    }
    return new_boundry;
}
export {create_cfg};

