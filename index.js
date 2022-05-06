const fs = require('fs')


function extractList(string) {
    const [_, ...rest] = string.split(' ')
    return rest
}
function extractTransitionStates(string) {
    return string.split(' ')
}

function buildTransitions(arrayOfTransitions, states) {
    const transitions = {}
    for (const transition of arrayOfTransitions) {
        const [from, key ,to] = transition
        if (!transitions[key]) {
            transitions[key] = []
        }
        transitions[key].push(states[parseInt(to)])
    }
    return transitions
}

function buildNode(acceptanceStates, node) {
    return {
        isAcceptance: acceptanceStates.includes(node),
    }
}

function buildStates(numberOfStates, acceptanceStates, transitionStates) {
    const states = []
    for (i = 0; i < numberOfStates; i++) {
        states.push(
            buildNode(acceptanceStates, i.toString())
        )
    }
    for (i = 0; i < numberOfStates; i++) {
        states[i].transitions = buildTransitions(
            transitionStates.filter(transition => transition[0] === i.toString()),
            states
        )
    }
    return states
}

const inputFile = fs.readFileSync('input.txt', 'utf8').split('\r\n')

const numberOfStates = parseInt(inputFile[0])
const terminalSymbols = extractList(inputFile[1])
const acceptanceStates = extractList(inputFile[2])
const numberOfTransitions = parseInt(inputFile[3])
const transitionStates = inputFile.slice(4, 4 + numberOfTransitions).map(state => extractTransitionStates(state))
const numberOfinputsIndex = 4 + numberOfTransitions
const numberOfInputs = parseInt(inputFile[numberOfinputsIndex])
const inputs = inputFile.slice(numberOfinputsIndex + 1, numberOfinputsIndex + numberOfInputs + 1)
const states = buildStates(numberOfStates, acceptanceStates, transitionStates)

// open file to write
const outputFile = fs.openSync('output.txt', 'w')

const traverse = (state, symbols) => {
    const [symbol, ...rest] = symbols
    if (symbol === '-' && !state.isAcceptance) return false
    if (symbol === '-' && state.isAcceptance) return true
    if (!symbol && state.isAcceptance) return true
    if (!symbol && !state.isAcceptance) return false
    if (state.transitions[symbol]) {
        let isAcceptance = false
        for (const nextState of state.transitions[symbol]) {
            isAcceptance = traverse(nextState, rest)
            if (isAcceptance) return true
        }
    }
    if (state.transitions['-']) {
        let isAcceptance = false
        for (const nextState of state.transitions['-']) {
            isAcceptance = traverse(nextState, symbols)
            if (isAcceptance) return true
        }
    }
    if (!state.transitions[symbol]) return false
}

inputs.forEach(input => {
    const symbols = Array.from(input)
    let isAcceptance = traverse(states[0], symbols)
    if (isAcceptance) {
        fs.writeSync(outputFile, `${input} aceita\n`)
    } else {
        fs.writeSync(outputFile, `${input} rejeita\n`)
    }
})
