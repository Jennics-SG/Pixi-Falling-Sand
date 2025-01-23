/** Pixi Falling Sand sim
 *  Jimy Houlbrook
 *  23/01/25
 */

import { Application, Container, Graphics, Color } from 'pixi.js'

class FallingSand{
    private _app: Application;              // Pixi Application
    private _grid: Array<Array<number>>;    // Grid of sand cells
    private _cursor: Graphics               // Cursor to draw graphics
    private _screen: Container              // Container to hold graphics

    private _sandSize: number = 5;          // Size of sand particle in px

    private _clickArea: number = 5;         // Spread of sand when spawning from click 

    private _mouseClicked: boolean = false; // Is the mouse being clicked?

    private _hue: number =  200;            // Current hue value

    // Intialise class variables
    constructor(){
        this._app = new Application();
        
        this._grid = this._makeGrid(
            window.innerWidth / this._sandSize,
            window.innerHeight / this._sandSize
        );
        
        this._screen = new Container();
        this._app.stage.addChild(this._screen);

        // By adding the cursor now we dont have to add it after each drawing
        this._cursor = new Graphics();
        this._screen.addChild(this._cursor)

        this._init();
    }

    // Intialise the application
    private async _init(){
        await this._app.init({
            width: window.innerWidth,
            height: window.innerHeight,
            canvas: <HTMLCanvasElement>document.getElementById("app"),
            background: 0x000000,
            antialias: true,
            hello: true
        });
        
        // Update & Draw function
        this._app.ticker.add(this._draw.bind(this))

        // Listeners for mouse events
        document.addEventListener("mousedown", this._onMouseDown.bind(this));
        document.addEventListener("mousemove", this._onMouseMove.bind(this));
        document.addEventListener("mouseup", this._onMouseUp.bind(this));
    }

    // MOUSE EVENTS -----------------------------------------------------------
    private _onMouseDown(e: MouseEvent){
        this._mouseClicked = true;
        // this._makeSand(e.x / this._sandSize, e.y / this._sandSize)
    }

    private _onMouseMove(e: MouseEvent){
        if(!this._mouseClicked) return
        this._makeSand(e.x / this._sandSize, e.y / this._sandSize)
    }

    private _onMouseUp(e: MouseEvent){
        this._mouseClicked = false;
    }
    // MOUSE EVENT END --------------------------------------------------------

    private _withinGrid(x: number, y: number): boolean{
        return x < this._grid.length
            && x > 0 
            && y < this._grid[0].length
            && y > 0
    }

    // Make a sand burst at x/y
    // x/y should be grid co-ords not pixel
    private _makeSand(x: number, y: number){
        // Outside of screen
        if(!this._withinGrid(x, y)) return;

        // Radius of click area
        let radius = Math.floor(this._clickArea / 2);

        // Create sand around click area
        for(let i = -radius; i <= radius; i++){
            for(let j = -radius; j <= radius; j++){
                let col = Math.floor(x + i);
                let row = Math.floor(y + j);
                if(!this._withinGrid(col, row)) continue;
                this._grid[col][row] = this._hue;
            }
        }

        // Incriment hue by 1
        this._hue = (this._hue + 1) % 360; 
    }

    // Create a 2D array of 0s 
    private _makeGrid(cols: number, rows: number): Array<Array<number>>{
        let c = new Array()
        for(let i = 0; i < cols; i++){
            let r = new Array()
            for(let j = 0; j < rows; j++){
                r.push(0)
            }
            c.push(r)
        }
        return c;
    }

    // Upodate the grid
    private async _gridUpdate(){
        let nextGrid = this._makeGrid(
            window.innerWidth / this._sandSize,
            window.innerHeight / this._sandSize
        );

        for(let i in this._grid){
            for(let j in this._grid[i]){
                let state = this._grid[i][j];
                if(state === 0) continue    // Nothing here

                let below = this._grid[i][parseInt(j) + 1]

                // Left or right?
                // let dir = Math.random() * 1 < 0.5 ? 1 : -1

                // Are below left / right empty?
                let belowA = -1;
                let belowB = -1;
                if(this._withinGrid(parseInt(i) + 1, parseInt(j) + 1))
                    belowA = this._grid[parseInt(i) + 1][parseInt(j) + 1]
                if(this._withinGrid(parseInt(i) - 1, parseInt(j) + 1))
                    belowB = this._grid[parseInt(i) - 1][parseInt(j) + 1]                

                // Is below empty?
                if(below === 0){
                    nextGrid[i][parseInt(j) + 1] = state
                } else if(belowA == 0) {
                    nextGrid[parseInt(i) + 1][parseInt(j) + 1] = state
                } else if (belowB == 0){
                    nextGrid[parseInt(i) - 1][parseInt(j) + 1] = state
                } else {    // Stay put
                    nextGrid[i][j] = state
                }
            }
        }
        return nextGrid
    }

    // Draw current state of grid to the screen
    private async _draw(){
        // Update Grid
        this._grid = await this._gridUpdate()
        
        // Clear screen
        this._cursor.clear();

        // Loop over grid to draw sand particles
        for(let i in this._grid){
            for(let j in this._grid[i]){
                let state = this._grid[i][j]

                // Draw nothing if not sand
                if(state == 0) continue;

                // Draw sand
                let x: number = parseInt(i) * this._sandSize;
                let y: number = parseInt(j) * this._sandSize;

                let fillCol = new Color({h: this._grid[i][j], s: 100, v: 100})

                this._cursor.rect(x, y, this._sandSize, this._sandSize);
                this._cursor.fill(fillCol)
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", _=> new FallingSand)