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
        transitions[key] = states[parseInt(to)]
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

inputs.forEach(input => {
    const chars = Array.from(input)
    try {
        let currentState = states[0]
        chars.forEach(char => {
            currentState = currentState.transitions[char]
            if (!currentState) {
                throw new Error()
            }
        })
        if (currentState.isAcceptance) {
            fs.writeSync(outputFile, 'aceita\n')
        } else {
            throw new Error()
        }
    } catch (e) {
        fs.writeSync(outputFile, 'rejeita\n')
    }
})
