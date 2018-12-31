import assert from 'assert';
import {create_cfg} from '../src/js/code-cgf';

describe('create cfg', () => { 
    /*it('is create cfg for a function with no argument correctly', () => {
        assert.equal(create_cfg('function foo(){let a = 1; \n let b = a + 3; \n let c = 0; \n if (b < a) { \n c = c + 5; \n } else if (b < a * 2) { \n c = c + a + 5; \n } else { \n c = c + b + 5; \n } \n return c; \n }',
                                '[{"start":1,"end":15},{"start":6,"end":12},{"start":8,"end":12},{"start":10,"end":12}]',
                                '[{"line":5,"cond":false,"type":"if"},{"line":7,"cond":false,"type":"if"}]'), '');
    });

    it('is create cfg for a function with if statment correctly', () => {
        assert.equal(create_cfg('function foo(x, y, z){let a = x + 1;let b = a + y;let c = 0;if (b < z) {c = c + 5;} else if (b < z * 2) {c = c + x + 5;} else {c = c + z + 5;}return c; }',
                                '[{"start":1,"end":15},{"start":6,"end":12},{"start":8,"end":12},{"start":10,"end":12}]',
                                '[{"line":5,"cond":false,"type":"if"},{"line":7,"cond":true,"type":"if"}]'), '');
    });*/

    it('is create cfg for a function with while statment correctly', () => {
        assert.equal(create_cfg('function foo(x, y, z){\n'+'\tlet a = x + 1;\n'+'\tlet b = a + y;\n'+'\tlet c = 0;\n\n'+'\twhile (a < z) {\n'+'\t\tc = a + b;\n'+'\t\tz = c * 2;\n'+'\t\ta++;\n'+'\t}\n\n'+'\treturn z;\n'+'}',
                                '[{"start":1,"end":13},{"start":6,"end":10}]',
                                '[{"line":5,"cond":true,"type":"while"}]'), 
                                'n2 [xlabel=1label="let a = x + 1; let b = a + y; let c = 0;", shape="square", fillcolor="#89E9AF", style=filled] n6 [xlabel=6label="c = a + b z = c * 2 a++", shape="square", fillcolor="#89E9AF", style=filled] n9 [xlabel=10label="return z;", shape="square", fillcolor="#89E9AF", style=filled] n5 [xlabel=5label="a < z", shape="diamond", fillcolor="#89E9AF", style=filled] n2 -> n5 [label=""] n5 -> n6 [label="true"] n5 -> n9 [label="false"] n6 -> n5 [label=""]');
    });
});