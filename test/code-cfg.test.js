import assert from 'assert';
import {create_cfg} from '../src/js/code-cgf';

describe('create cfg', () => { 
    it('is create cfg for a function with no argument correctly', () => {
        assert.equal(create_cfg('function foo(){\n\tlet a = 1;\n\tlet b = a + 3;\n\tlet c = 0;\n\tif (b < a) {\n\t\t c = c + 5;\n\t} else if (b < a * 2) {\n\t\tc = c + a + 5; \n\t} else {\n\t\t c = c + b + 5;\n}\n\treturn c;\n}',
                                [{start:1,end:15},{start:6,end:12},{start:8,end:12},{start:10,end:12}],
                                [{line:5,cond:false,type:"if"},{line:7,cond:false,type:"if"}]), 'n2 [xlabel=1label=\"let a = 1;\nlet b = a + 3;\nlet c = 0;\nb < a\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn8 [xlabel=6label=\"b < a * 2\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn7 [xlabel=10label=\"return c;\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn6 [xlabel=5label=\"c = c + 5\", shape=\"diamond\", fillcolor=\"black\"]\nn9 [xlabel=7label=\"c = c + a + 5\", shape=\"diamond\", fillcolor=\"black\"]\nn10 [xlabel=9label=\"c = c + b + 5\", shape=\"diamond\", fillcolor=\"#89E9AF\", style=filled]\nn2 -> n6 [label=\"true\"]\nn2 -> n8 [label=\"false\"]\nn6 -> n7 [label=\"\"]\nn8 -> n9 [label=\"true\"]\nn8 -> n10 [label=\"false\"]\nn9 -> n7 [label=\"\"]\nn10 -> n7 [label=\"\"]');
    });

    it('is create cfg for a function with if statment correctly', () => {
        assert.equal(create_cfg('function foo(x, y, z){\n\tlet a = x + 1;\n\tlet b = a + y;\n\tlet c = 0;\n\tif (b < z) {\n\t\tc = c + 5;\n\t} else if (b < z * 2) {\n\t\tc = c + x + 5;\n\t} else {\n\t\tc = c + z + 5;\n\t}return c; \n}',
                                [{start:1,end:15},{start:6,end:12},{start:8,end:12},{start:10,end:12}],
                                [{line:5,cond:false,type:"if"},{line:7,cond:true,type:"if"}]), 'n2 [xlabel=1label=\"let a = x + 1;\nlet b = a + y;\nlet c = 0;\nb < z\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn8 [xlabel=6label=\"b < z * 2\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn7 [xlabel=10label=\"return c;\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn6 [xlabel=5label=\"c = c + 5\", shape=\"diamond\", fillcolor=\"black\"]\nn9 [xlabel=7label=\"c = c + x + 5\", shape=\"diamond\", fillcolor=\"black\"]\nn10 [xlabel=9label=\"c = c + z + 5\", shape=\"diamond\", fillcolor=\"#89E9AF\", style=filled]\nn2 -> n6 [label=\"true\"]\nn2 -> n8 [label=\"false\"]\nn6 -> n7 [label=\"\"]\nn8 -> n9 [label=\"true\"]\nn8 -> n10 [label=\"false\"]\nn9 -> n7 [label=\"\"]\nn10 -> n7 [label=\"\"]');
    });

    it('is create cfg for a function with true while statment correctly', () => {
        assert.equal(create_cfg('function foo(x, y, z){\n\tlet a = x + 1;\n\tlet b = a + y;\n\tlet c = 0;\n\n\twhile (a < z) {\n\t\tc = a + b;\n\t\tz = c * 2;\n\t\ta++;\n\t}\n\n\treturn z;\n}',
                                [{start:1,end:13},{start:6,end:10}],                                
                                [{line:5,cond:true,type:"while"}]),
                                'n2 [xlabel=1label=\"let a = x + 1;\nlet b = a + y;\nlet c = 0;\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn6 [xlabel=6label=\"c = a + b\nz = c * 2\na++\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn9 [xlabel=10label=\"return z;\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn5 [xlabel=5label=\"a < z\", shape=\"diamond\", fillcolor=\"#89E9AF\", style=filled]\nn2 -> n5 [label=\"\"]\nn5 -> n6 [label=\"true\"]\nn5 -> n9 [label=\"false\"]\nn6 -> n5 [label=\"\"]');
    });

    it('is create cfg for a function with false while statment correctly', () => {
        assert.equal(create_cfg('function foo(x, y, z){\n\tlet a = x + 1;\n\tlet b = a + y;\n\tlet c = 0;\n\twhile (a > z) {\n\t\tc = a + b;\n\t\tz = c * 2;\n\t\ta++;\n\t}\n\treturn z;\n}',
                                [{start:1,end:11},{start:5,end:9}],                                
                                [{line:5,cond:false,type:"while"}]),
                                'n2 [xlabel=1label=\"let a = x + 1;\nlet b = a + y;\nlet c = 0;\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn6 [xlabel=5label=\"c = a + b\nz = c * 2\na++\", shape=\"square\", fillcolor=\"black\"]\nn9 [xlabel=9label=\"return z;\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn5 [xlabel=4label=\"a > z\", shape=\"diamond\", fillcolor=\"#89E9AF\", style=filled]\nn2 -> n5 [label=\"\"]\nn5 -> n6 [label=\"true\"]\nn5 -> n9 [label=\"false\"]\nn6 -> n5 [label=\"\"]');
    });

    it('is create cfg for a function no variable decleration correctly', () => {
        assert.equal(create_cfg('function foo(x){\n\twhile(x>8){\n\t\tx--;\n}\n\treturn x;\n}',
                                [{start:1,end:6},{start:2,end:4}],                                
                                [{line:2,cond:false,type:"while"}]),
                                'n3 [xlabel=2label=\"x--\", shape=\"square\", fillcolor=\"black\"]\nn4 [xlabel=4label=\"return x;\", shape=\"square\", fillcolor=\"black\"]\nn2 [xlabel=1label=\"x>8\", shape=\"diamond\", fillcolor=\"black\"]\nn2 -> n3 [label=\"true\"]\nn2 -> n4 [label=\"false\"]\nn3 -> n2 [label=\"\"]');
    });

    it('is create cfg for a function with while inside if correctly', () => {
        assert.equal(create_cfg('function foo(x, y, z){\n\tlet a = x + 1;\n\tlet b = a + y;\n\tlet c = 0;\n\n\tif(c <= 0){\n\t\twhile (a >= z) {\n\t\t\tc = a + b;\n\t\t\tz = c * 2;\n\t\t\ta++;\n\t\t}\n\t}\n\treturn z;\n}',
                                [{start:1,end:14},{start:6,"end":12},{start:7,end:11}],                                
                                [{line:5,cond:true,type:"if"},{line:6,cond:false,type:"while"}]),
                                'n2 [xlabel=1label=\"let a = x + 1;\nlet b = a + y;\nlet c = 0;\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn7 [xlabel=7label=\"c = a + b\nz = c * 2\na++\", shape=\"square\", fillcolor=\"black\"]\nn10 [xlabel=11label=\"return z;\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn5 [xlabel=5label=\"c <= 0\", shape=\"diamond\", fillcolor=\"#89E9AF\", style=filled]\nn6 [xlabel=6label=\"a >= z\", shape=\"diamond\", fillcolor=\"#89E9AF\", style=filled]\nn2 -> n5 [label=\"\"]\nn5 -> n6 [label=\"true\"]\nn5 -> n10 [label=\"false\"]\nn6 -> n7 [label=\"true\"]\nn6 -> n10 [label=\"false\"]\nn7 -> n6 [label=\"\"]');
    });

    it('is create cfg for a function with while inside if correctly 2', () => {
        assert.equal(create_cfg('function foo(x, y, z){\n\tlet a = x + 1;\n\tlet b = a + y;\n\tlet c = 0;\n\n\tif(c <= 0){\n\t\twhile (a <= z) {\n\t\t\tc = a + b;\n\t\t\tz = c * 2;\n\t\t\ta++;\n\t\t}\n\t}\n\treturn z;\n}',
                                [{start:1,end:14},{start:6,"end":12},{start:7,end:11}],                                
                                [{line:5,cond:true,type:"if"},{line:6,cond:true,type:"while"}]),
                                'n2 [xlabel=1label=\"let a = x + 1;\nlet b = a + y;\nlet c = 0;\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn7 [xlabel=7label=\"c = a + b\nz = c * 2\na++\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn10 [xlabel=11label=\"return z;\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn5 [xlabel=5label=\"c <= 0\", shape=\"diamond\", fillcolor=\"#89E9AF\", style=filled]\nn6 [xlabel=6label=\"a <= z\", shape=\"diamond\", fillcolor=\"#89E9AF\", style=filled]\nn2 -> n5 [label=\"\"]\nn5 -> n6 [label=\"true\"]\nn5 -> n10 [label=\"false\"]\nn6 -> n7 [label=\"true\"]\nn6 -> n10 [label=\"false\"]\nn7 -> n6 [label=\"\"]');
    });

    it('is create cfg for a function with if inside while correctly', () => {
        assert.equal(create_cfg('function foo(x, y, z){\n\tlet a = x + 1;\n\tlet b = a + y;\n\tlet c = 0;\n\n\twhile(c >= 0){\n\t\tif (a >= z) {\n\t\t\tc = a + b;\n\t\t\tz = c * 2;\n\t\t\ta++;\n\t\t}\n\t}\n\treturn z;\n\t}',
                                [{start:1,end:14},{start:6,"end":12},{start:7,end:11}],                                
                                [{line:5,cond:true,type:"while"},{line:6,cond:false,type:"if"}]),
                                'n2 [xlabel=1label=\"let a = x + 1;\nlet b = a + y;\nlet c = 0;\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn7 [xlabel=7label=\"c = a + b\nz = c * 2\na++\", shape=\"square\", fillcolor=\"black\"]\nn10 [xlabel=11label=\"return z;\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn5 [xlabel=5label=\"c >= 0\", shape=\"diamond\", fillcolor=\"#89E9AF\", style=filled]\nn6 [xlabel=6label=\"a >= z\", shape=\"diamond\", fillcolor=\"#89E9AF\", style=filled]\nn2 -> n5 [label=\"\"]\nn5 -> n6 [label=\"true\"]\nn5 -> n10 [label=\"false\"]\nn6 -> n7 [label=\"true\"]\nn6 -> n5 [label=\"false\"]\nn7 -> n5 [label=\"\"]');
    });

    it('is create cfg for a function with if inside while correctly 2', () => {
        assert.equal(create_cfg('function foo(x, y, z){\n\tlet a = x + 1;\n\tlet b = a + y;\n\tlet c = 0;\n\n\twhile(c >= 0){\n\t\tif (a <= z) {\n\t\t\tc = a + b;\n\t\t\tz = c * 2;\n\t\t\ta++;\n\t\t}\n\t}\n\treturn z;\n\t}',
                                [{start:1,end:14},{start:6,"end":12},{start:7,end:11}],                                
                                [{line:5,cond:true,type:"while"},{line:6,cond:true,type:"if"}]),
                                'n2 [xlabel=1label=\"let a = x + 1;\nlet b = a + y;\nlet c = 0;\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn7 [xlabel=7label=\"c = a + b\nz = c * 2\na++\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn10 [xlabel=11label=\"return z;\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn5 [xlabel=5label=\"c >= 0\", shape=\"diamond\", fillcolor=\"#89E9AF\", style=filled]\nn6 [xlabel=6label=\"a <= z\", shape=\"diamond\", fillcolor=\"#89E9AF\", style=filled]\nn2 -> n5 [label=\"\"]\nn5 -> n6 [label=\"true\"]\nn5 -> n10 [label=\"false\"]\nn6 -> n7 [label=\"true\"]\nn6 -> n5 [label=\"false\"]\nn7 -> n5 [label=\"\"]');
    });

    it('is create cfg for a function with multuply while correctly', () => {
        assert.equal(create_cfg('function foo(x, y, z){\n\tlet a = x + 1;\n\tlet b = a + y;\n\tlet c = 0;\n\n\tif(c > 0){\n\t\tb++;\n\t}else if(a > 2){\n\t\twhile (a >= z) {\n\t\t\ta++;\n\t\t}\n\t}else{\n\t\twhile (a <= z) {\n\t\t\ta++;\n\t\t}\n\t}\n\treturn z;\n}',
                                [{start:1,end:18},{start:6,end:16},{start:8,end:16},{start:9,end:11},{start:12,end:16},{start:13,end:15},{start:13,end:15}],                                
                                [{line:5,cond:false,type:"if"},{line:7,cond:false,type:"if"},{line:8,cond:false,type:"while"},{line:12,cond:true,type:"while"},{line:12,cond:false,type:"while"}]),
                                'n2 [xlabel=1label=\"let a = x + 1;\nlet b = a + y;\nlet c = 0;\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn6 [xlabel=6label=\"b++\", shape=\"square\", fillcolor=\"black\"]\nn10 [xlabel=9label=\"a++\", shape=\"square\", fillcolor=\"black\"]\nn12 [xlabel=13label=\"a++\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn7 [xlabel=15label=\"return z;\", shape=\"square\", fillcolor=\"#89E9AF\", style=filled]\nn5 [xlabel=5label=\"c > 0\", shape=\"diamond\", fillcolor=\"#89E9AF\", style=filled]\nn8 [xlabel=7label=\"a > 2\", shape=\"diamond\", fillcolor=\"#89E9AF\", style=filled]\nn9 [xlabel=8label=\"a >= z\", shape=\"diamond\", fillcolor=\"black\"]\nn11 [xlabel=12label=\"a <= z\", shape=\"diamond\", fillcolor=\"#89E9AF\", style=filled]\nn2 -> n5 [label=\"\"]\nn5 -> n6 [label=\"true\"]\nn5 -> n8 [label=\"false\"]\nn6 -> n7 [label=\"\"]\nn8 -> n9 [label=\"true\"]\nn8 -> n11 [label=\"false\"]\nn9 -> n10 [label=\"true\"]\nn9 -> n7 [label=\"false\"]\nn10 -> n9 [label=\"\"]\nn11 -> n12 [label=\"true\"]\nn11 -> n7 [label=\"false\"]\nn12 -> n11 [label=\"\"]');
    });
});