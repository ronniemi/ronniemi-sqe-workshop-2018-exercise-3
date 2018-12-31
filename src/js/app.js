import $ from 'jquery';
import {symbolic_substitutio, color_code} from './code-coloring';
import {create_cfg} from './code-cgf';
import * as escodegen from 'escodegen';
import * as d3 from 'd3-graphviz';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let code_to_cfg = $('#codePlaceholder').val();
        console.log(code_to_cfg);
        let input_vector = get_input_from_string($('#inputVector').val());
        $('#graph_code').html('');

        let symbolic_substitution_output = symbolic_substitutio(code_to_cfg);
        let symbolic_substitution_obj = symbolic_substitution_output[0];
        let boundry_table = symbolic_substitution_output[1];
        let symbolic_substitution_string = escodegen.generate(symbolic_substitution_obj);

        let color_table = color_code(symbolic_substitution_string, input_vector);

        var final_dot = create_cfg(code_to_cfg, boundry_table, color_table);
        console.log(final_dot);
        draw_graph(final_dot);
    });
});

const draw_graph = (dot) => {
    d3.graphviz('#graph_code').renderDot('digraph  {' + dot + '}');
};

const get_input_from_string = (input_vector_str) => {
    let input_vector = [];
    let input_arr = input_vector_str.split(';');
    input_arr.forEach(element => {
        if(!element.includes('"') && !element.includes('\'')){
            if(element.includes('[')){
                element = element.substring(1, element.length-1);
                element = element.replace(/[,]/g, ';');
                element = get_input_from_string(element);
                
            }
            else if(isNumeric(element)){
                element = parseFloat(element);
            }
        }
        input_vector.push(element);
    });
    return input_vector;
};

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

