// Paulo Roberto Domingues dos Santos NUSP: 11838721
// Thiago Ribeiro Goveia NUSP: 10835942

const fs = require('fs')


function extractList(string) {
    const [_, ...rest] = string.split(' ') // serarar string por expaços para uam array desprezando o primeiro elemento
    return rest
}
function extractTransitionStates(string) {
    return string.split(' ') // separar string por espaços
}

// criar objeto de trnasições
function buildTransitions(arrayOfTransitions, states) {
    const transitions = {}
    for (const transition of arrayOfTransitions) {
        const [from, symbol ,to] = transition
        // cada simbolo pode ter varias transições, então criar uma array e adicionar a transição à ela
        if (!transitions[symbol]) {
            transitions[symbol] = []
        }
        transitions[symbol].push(states[parseInt(to)]) // cada transição guarda a referencia para o estado de destino
    }
    return transitions
}

// criar objeto de estado
function buildNode(acceptanceStates, node) {
    return {
        isAcceptance: acceptanceStates.includes(node),
    }
}

function buildStates(numberOfStates, acceptanceStates, transitionStates) {
    const states = []
    // adicionar objetos de estado à array
    for (i = 0; i < numberOfStates; i++) {
        states.push(
            buildNode(acceptanceStates, i.toString())
        )
    }
    // setar transições entre estados
    for (i = 0; i < numberOfStates; i++) {
        states[i].transitions = buildTransitions(
            transitionStates.filter(transition => transition[0] === i.toString()),
            states
        )
    }
    return states
}

// Ler arquivo e extrar array de cada linha
const inputFile = fs.readFileSync('input.txt', 'utf8').split('\r\n')

const numberOfStates = parseInt(inputFile[0]) // extrair numero de estados
const terminalSymbols = extractList(inputFile[1]) // extrair simbolos terminais
const acceptanceStates = extractList(inputFile[2]) // extrair estados de aceitação
const numberOfTransitions = parseInt(inputFile[3]) // extrair numero de transições
const transitionStates = inputFile.slice(4, 4 + numberOfTransitions).map(state => extractTransitionStates(state)) // extrair transições
const numberOfinputsIndex = 4 + numberOfTransitions // Calcular index do numero de inputs
const numberOfInputs = parseInt(inputFile[numberOfinputsIndex]) // extrair numero de inputs
const inputs = inputFile.slice(numberOfinputsIndex + 1, numberOfinputsIndex + numberOfInputs + 1) // extrair inputs
const states = buildStates(numberOfStates, acceptanceStates, transitionStates) // construir grafo de estados estados

const outputFile = fs.openSync('output.txt', 'w')

// percorrer grafo verificando aceitação
const traverse = (state, symbols) => {
    const [symbol, ...rest] = symbols  // separe a array de caracteres em cabeça | calda
    if (symbol === '-' && !state.isAcceptance) return false // se cadeia vazia e não é estado de aceitação, rejeite
    if (symbol === '-' && state.isAcceptance) return true // se cadeia vazia e é estado de aceitação, aceite
    // se não temos um simbiolo, então toda a cadeia foi processada
    if (!symbol && state.isAcceptance) return true  // se é estado de aceitação, aceite
    if (!symbol && !state.isAcceptance) return false // se não é estado de aceitação, rejeite

    // percorrer array de transições para o simbolo atual
    if (state.transitions[symbol]) {
        let isAcceptance = false
        for (const nextState of state.transitions[symbol]) {
            isAcceptance = traverse(nextState, rest) // percorrer grafo para cada transição
            if (isAcceptance) return true // se um estado de aceitação for encontrado, aceite
        }
    }
    // se houverem transições vazias, percorra grafo em buscar proximo simbolo
    if (state.transitions['-']) {
        let isAcceptance = false
        for (const nextState of state.transitions['-']) {
            isAcceptance = traverse(nextState, symbols)
            if (isAcceptance) return true
        }
    }
    // se não existe transição para o simbolo atual, rejeite
    if (!state.transitions[symbol]) return false
}

inputs.forEach(input => {
    const symbols = Array.from(input)
    let isAcceptance = traverse(states[0], symbols)
    if (isAcceptance) {
        fs.writeSync(outputFile, 'aceita\n')
    } else {
        fs.writeSync(outputFile, 'rejeita\n')
    }
})
