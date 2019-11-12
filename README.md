# Shallow key

This package exists to have a proper way of giving 'random' keys to map a collection in React.
It actually gives a hash code to every element of an array, no matter the type. So it can be used 
outside React too. Same object should give same key, but will only do a shallow attribute check. 

## Usage

```JSX
import mapWithKey from 'sallow-key';

const ParentComponent = () => {
render() {
    return (
      <div>
        <p>Render of parent gets called every second -> {this.state.date}.</p>
        <ul>
        {mapWithKey(exampleArray, ((el, key) => (
          <ListItem key={ key } val={ el } />
        ))}
        </ul>
      </div>
    );
  }
```

## Motivation

Suppose we have a React component, that has a children collection. This is typically rendered
with a *'map'* function. One of the first thing you learn with React is that you have to provide __key__
attributes to all the components from the collection, so React can have a reference to these for future renders.
There cannot be duplicated keys on the same collection. 

One typical solution is to use the index attribute of *map()* like so:

```JSX
const List = () => {
    const exampleArray = ['foo', 'bar', 'foo'];
    return (
      <ul>
        {exampleArray.map(elem, i) => (
            <li key={'item-' + i}>
                {elem}
            </li>
        )}
      </ul>;
    );  
};
```
This effectively disables the console warning, so we're good to go, right? Well, not so fast. 
If you've used Eslint, probably you've used Airbnb defaults also. And then your build won't pass
with this code. And there's a [valid reason for it](https://medium.com/@robinpokorny/index-as-a-key-is-an-anti-pattern-e0349aece318).

Ok, so what now? They suggest to have a unique ID on the collection elements themselves. 
But what if this is not an option, because you don't have control over the array elements?

### First try

Probably you'll come up with a random key generator, that will ensure keys are not repeated, and will
effectively remove the warning. But this turned out to be, again, not a good idea. Bear with me.

We have a parent class, wich shows a clock updating every second, and also shows an unordered list
like in the previous example. The timer, which is unrelated to the list, does a state change every second,
therefore triggers a render every second. This render shouldn't affect the list collection. 

````JSX
const exampleArray = [1, 2, 3, 4, 5];

class Clock extends React.Component {
  state = {
    date: new Date().toLocaleString()
  }

  componentDidMount() {
    this.intervalID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  tick() {
    this.setState({
      date: new Date().toLocaleTimeString()
    });
  }

  render() {
    return (
      <div>
        <p>Render of parent gets called every second -> {this.state.date}.</p>
        <ul>
        {exampleArray.map(el => (
          <ListItem val={ el } />
        ))}
        </ul>
      </div>
    );
  }
}
````
Where \<ListItem /> is a simple component that will update a counter everytime it mounts, for showcase 
purposes. 
````JSX
let globalCounter = 0;
const counterOutput = document.getElementById('counter');

class ListItem extends React.Component {
  componentDidMount() {
    counterOutput.textContent = `ListItem mounted ${globalCounter++} times`;
  }
  render() {
    const { val } = this.props;
    return <li>Child { val }</li>;
  }
} 
````

Now, because we didn't set any key on the parent map() function, we get this warning:
``"Warning: Each child in a list should have a unique 'key' prop. Check the render method of `Clock`.
See https://fb.me/react-warning-keys for more information.%s
``

So, because using the map index argument is not an option, we use a random key generator, in this case 
I chose a simple one, [npm shortid package](https://www.npmjs.com/package/shortid). So the Clock render 
function looks like this:
````JSX
  render() {
    return (
      <div>
        <p>Render of parent gets called every second -> {this.state.date}.</p>
        <ul>
        {exampleArray.map(el => (
          <ListItem key={shortid.generate()} val={ el } />
        ))}
        </ul>
      </div>
    );
  }
}
````
This works, but there is a big performance problem here: every time that the parent renders (every second),
the list of ListItems gets remounted. This happens because the key is recalculated, and for React a different
key means a completely different component. We can easily see this by checking if componentDidMount gets called every
time. 

Here is [a codepen](https://codepen.io/JavRok/pen/xxxwevR) with a demo of the problem. 

## Solution

Shallow-key solves the problem by doing a quick hash over each item of the collection, uniquely identifying them
by checking their _superficial_ properties. 

````JSX
  render() {
    return (
      <div>
        <p>Render of parent gets called every second -> {this.state.date}.</p>
        <ul>
        {mapWithKey(exampleArray, ((el, key) => (
          <ListItem key={ key } val={ el } />
        ))}
        </ul>
      </div>
    );
  }
}
````
`mapWithKey` is just a wrapper of `Array.map`, but adds the key of the element in every iteration. 


### Installing

```
npm install --save shallow-key
```

### Running the tests
If curious or forking the repo, the Jest tests can be run like so: 
```
npm run test
```

## Built With

* [Crypto](https://nodejs.org/api/crypto.html) - Native node module for hashing
* [Jest](https://jestjs.io/) - Unit testing

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
