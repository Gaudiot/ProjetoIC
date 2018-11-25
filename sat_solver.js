//(CHECKED)
function readFormula(fileName) {
    const fs = require('fs');
    let text = fs.readFileSync(fileName, 'utf8');

    let lines = text.split('\n');
    let clauses = readClauses(lines);
    let variables = readVariables(lines);
    variables.fill(0);

    let specOk = checkProblemSpecification(lines, clauses, variables);

    let result = { 'clauses': [], 'variables': [] };
    if (specOk) {
        result.clauses = clauses;
        result.variables = variables;
    }
    return result
}

//verifica se é viável continuar o teste
function checkProblemSpecification(lines, clauses, variables) {
    let value;
    let max = 0;
    for(let i = 0 ; i < lines.length ; i++){
        if(lines[i].charAt(0) === 'p'){
            let parameters = lines[i].split(' ');
            if(parseInt(parameters[3], 10) === clauses.length){
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

//ler as clausulas da questao(CHECKED)
function readClauses(lines){
    let clauses = new Array();
    let arr = [];
    for(let f = 0 ; f < lines.length ; f++){
        let first = lines[f].charAt(0) + lines[f].charAt(1);
        if(!isNaN(parseInt(first, 10))){
            let last = lines[f].charAt(lines[f].length - 1);
            let temp = lines[f].split(' ').map(Number);
            arr = arr.concat(temp);
            if(parseInt(last, 10) === 0){
                arr.pop();
                clauses[clauses.length] = arr;
                arr = [];
            }
        }
    }
    return clauses;
}

//criar a array de variaveis(CHECKED)
function readVariables(lines){
    let max = 0;
    for(let i = 0 ; i < lines.length ; i++){
        if(lines[i].charAt(0) === 'p'){
            let parameters = lines[i].split(' ');
            return new Array(parseInt(parameters[2], 10));
        }else if(lines[i].charAt(0) !== 'c' ){
            let divide = lines[i].split(' ');
            for(let f = 0 ; f < divide.length ; f++){
                if(Math.abs(divide[f]) > max){
                    max = Math.abs(divide[f]);
                }
            }
        }
    }
    return new Array(max);
}

//(CHECKED)
exports.solve = function(fileName) {
    //let start = new Date;
    let formula = readFormula(fileName);
    let result = doSolve(formula.variables, formula.clauses);
    //let end = new Date;
    //console.log('time: ' + (end - start)/1000);
    return result;
}

//Funcao para verificar finalizacao das possibilidades(CHECKED)
function hasNextAssignment(variables){
    for(let i = 0 ; i < variables.length ; i++){
        if(variables[i] === 1){
            return true;
        }
    }
    return false;
}

//Recebe a possibilidade atual e retorna a próxima(CHECKED)
function nextAssignment(variables, pos) {
    if(pos >= 0){
        if(variables[pos] === 1){
            variables[pos] = 0;
            return nextAssignment(variables, --pos);
        }else if(variables[pos] === 0){
            variables[pos] = 1;
            return variables
        }
    }
    return variables;
}

//checa se é falso(CHECKED)
function isFalse(variables, clause){
    for(let i = 0; i < clause.length ; i++){
        if(clause[i] === 0){
            continue;
        }else if(clause[i] < 0){
            if(variables[(clause[i] * -1) - 1] === 0){
                return false;
            }
        }else if(variables[clause[i] - 1] === 1){
            return false;
        }
    }
    return true;
}

//Resolve o SAT(CHECKED)
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
    //console.log(result.satisfyingAssignment);
    return result
}