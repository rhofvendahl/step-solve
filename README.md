# StepSolve

#### By Russell Hofvendahl

## About
StepSolve (live at [stepsolve.us](https://stepsolve.us))is a step-by-step calculator, designed to provide an intuitive demonstration of the order of opoerations for arithmetic.

## Setup
1. Clone this repo and navigate to the root directory.
```
git clone https://github.com/rhofvendahl/zenscape-react
cd movie_finder_api
```

2. Install dependencies.
```
yarn install
```

## Scripts
To serve locally:
```
yarn start
```

To run tests:
```
yarn test
```

To generate production build:
```
yarn build
```

## Structure
Below I'll give a quick overview of StepSolve's logic & layout.

### Evaluation
All evaluation logic is in src/solve.ts. The basic algorithm is as follows:

1. The input expression is parsed into tokens representing numbers, operators and parentheses.
2. Dashes representing negatives (rather than subtraction) are identified, and where possible "resolved" (combined with a following number, which is inverted).
3. A single operation is performed on the token sequence, determined order of operations.
4. A description of this operation is generated after the fact (as a simpler alternative to passing meta-information along through each function and sub-function amidst changing indices).
5. 3 and 4 are repeated until a single token remains, at which time the collected token sequences and operation descriptions are returned as a set of "step" objects.

It may be worth noting that this step-by-step approach represents an intentional sacrifice of simplicity & efficiency for human readable output.

### Rendering
A good entry point for StepSolve's UI is src/components/Solver.tsx, which describes the parent component of all other visible components.

Among these child components I'd recommend checking out "Step", which describes the logic necessary in creating the colored boxes around each "computedFrom" sequence (the part of an expression which contains the tokens about to be operated on) and the matching text color for each "computed" token (the number on the following line that results from that operation).

## Gripes
In developing this application, I was met with many unexpected gotchas, caveats and edge cases. To list a few:

#### Negatives
* Dashes do different things when they signify "negative" versus "subtract", and it took a lot of whiteboarding and headscratching to generate a consistent set of rules for detecting, validating and applying the two operators.
* One fun one is that in cases like "-2^-3", the dash before 3 is resolved _before_ exponentiation while the dash before 2 is resolved after.
* Another: when a "neg" sign is followed by an "(", it must be kept around until the parentheses resolve in order to be applied to the resulting number.

#### Ordinal Suffixes
* This is pretty inconsequential, but the rules for which letters go at the end of "1st", "2nd", "3rd" etc. are weird.
* Most ordinals end in "th", unless the last digit is "1", "2", or "3", which have their own - _unless_ the last _two__ digits are "11", "12" or "13".
* For the sake of ease I just used "th" for all numbers with decimals, though I honestly couldn't say if this is correct.

All in all, StepSolve provided a great reminder of how hard it is to break down intuitive processes into machine-readable rules.