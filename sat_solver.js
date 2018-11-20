function readFormula(fileName) {
    const fs = require('fs');
    let text = fs.readFileSync(fileName, 'utf8');

    let lines = text.toString().split('\n');
    let clauses = readClauses(lines);
    let numberVariables = readVariables(lines);

    //criacao da array inicial de variáveis
    let variables = new Array(numberVariables);
    variables.fill(0);

    let specOk = checkProblemSpecification(lines, clauses, variables);

    let result = { 'clauses': [], 'variables': [] };
    if (specOk) {
        result.clauses = clauses;
        result.variables = variables;
    }
    return result
}

function checkProblemSpecification(lines, clauses, variables) {
    let value;
    let max = 0;
    for(let i = 0 ; i < lines.length ; i++){
        if(lines[i].charAt(0) === 'p'){
            let parameters = lines[i].split(' ');
            if(parameters[3] === clauses.length){
                value = true;
            }else{
                value = false;
            }
        }else if(lines[i].charAt(0) !== 'c'){
            let divide = lines[i].split(' ');
            for(let f = 0 ; f < divide.length ; f++){
                if(Math.abs(divide[f]) > max){
                    max = Math.abs(divide[f]);
                }
            }
        }
    }

    if(value && max <= variables.length){
        return true;
    }else{
        return false;
    }
}

function readClauses(lines){
    let clauses = new Array();
    let i = 0;
    let arr = [];
    for(let f = 0 ; f < lines.length ; f++){
        let first = lines[f].charAt(0);
        let last = lines[f].charAt(lines.length - 1);
        if(first !== 0 && first !== 'c' && first !== 'p'){
            let temp = lines[f].split(' ');
            arr = arr.concat(temp);
            if(last === 0){
                clauses[i] = arr;
                arr = [];
                i++;
            }
        }
    }
    return clauses;
}

function readVariables(lines){
    for(let i = 0 ; i < lines.length ; i++){
        if(lines[i].charAt(0) === 'p'){
            let parameters = lines[i].split(' ');
            return parameters[2];
        }
    }
}

exports.solve = function(fileName) {
    let formula = readFormula(fileName);
    let result = doSolve(formula.variables, formula.clauses);
    return result;
}

//Funcao para verificar finalizacao das possibilidades
function hasNextAssignment(arr){
    for(let i = 0 ; i < arr.length ; i++){
        if(arr[i] === 1){
            return true;
        }
    }
    return false;
}

//Recebe a possibilidade atual e retorna a próxima
function nextAssignment(arr, pos) {
    if(pos >= 0){
        if(arr[pos] === 1){
            arr[pos] = 0;
            return nextAssignment(arr, --pos);
        }else if(arr[pos] === 0){
            arr[pos] = 1;
            return arr;
        }
    }
    return arr;
}

//checa se é falso
function isFalse(arr, clause){
    //fazer as negações
    for(let i = 0; i < clause.length ; i++){
        if(clause[i] < 0){
            clause[i] *= -1;
            let vari = arr[clause[i] - 1];
            if(vari === 0){
                vari = 1;
            }else if(vari === 1){
                vari = 0;
            }
        }
    }
    //checa se tem como ser falso
    for(let i = 0 ; i < clause.length; i++){
        if(arr[clause[i] - 1] === 1){
            return false;
        }
    }
    return true;
}

//Resolve o SAT
function doSolve(variables, clauses) {
    let isSat = false;
    do {
        for(let i = 0 ; i < clauses.length ; i++){
            if(isFalse(variables, clauses[i])){
                variables = nextAssignment(variables, variables.length - 1);
                break;
            }else if(i === (clauses.length - 1)){
                isSat = true;
            }
        }
    }while(!isSat && hasNextAssignment(variables));

    let result = {'isSat': isSat, satisfyingAssignment: null};
    if (isSat) {
        result.satisfyingAssignment = variables;
    }
    return result
}

readFormula('simple0.cnf')