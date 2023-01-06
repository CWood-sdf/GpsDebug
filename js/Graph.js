class Graph {
    data = [];
    highlight = 0;
    title = "";
    constructor(x, y, width, height, dataCol, title, dataRange = [10, 0], vertSub = 10) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.range = dataRange;
        this.col = dataCol;
        this.vertSub = vertSub;
        this.title = title;
    }
    moveHighlightEnd() {
        this.highlight = this.data.length - 1;
    }
    setHighlight(i) {
        
        if (i < this.data.length && 0 <= i) {
            this.highlight = i;    
        }
    }
    incHighlight() {
        if (this.highlight < this.data.length - 1) {
            this.highlight++;
        }
    }
    inputData(d) {
        this.data = d;
    }
    customizeRange() {
        if(this.data.length === 0) return;
        this.range = [this.data[0], this.data[0]];
        for (var i of this.data) {
            this.range[0] = Math.max(i, this.range[0]);
            this.range[1] = Math.min(i, this.range[1]);
        }
        var rangeSize = this.range[0] - this.range[1];
        this.range[0] += 0.05 * rangeSize;
        this.range[1] -= 0.05 * rangeSize;
    }
    draw() {
        var dWidth = this.data.length;
        var xInc = this.width / dWidth;
        var rangeSize = this.range[0] - this.range[1];
        var rangeMult = this.height / rangeSize;
        p.fill(255);
        p.noStroke();
        p.rect(this.x * height, this.y * height, this.width * height, this.height * height);
        p.textSize(Math.min(20, this.width * height / 10));
        p.textAlign(p.CENTER);
        p.fill(0);
        p.text(this.title, (this.x + this.width / 2) * height, (this.y - 1) * height);
        {
            var pt = this.data[this.highlight];
            var newX = xInc * this.highlight;
            p.strokeWeight(1);
            p.stroke(0);
            newX += this.x;
            p.line(newX * height, this.y * height, newX * height, (this.y + this.height) * height);;
        } // Line Highlight
        if(this.data.length !== 0){
            //Show the average value
            var avg = 0;
            for (var i of this.data) {
                avg += i;
            }
            avg /= this.data.length;
            //Draw a line at the average
            p.stroke(0);
            p.strokeWeight(1);
            var newY = rangeMult * avg * -1 + this.range[1] * rangeMult;
            newY += this.y + this.height;
            p.line(this.x * height, newY * height, (this.x + this.width) * height, newY * height);
        } // Average line
        {
            p.stroke(0);
            p.strokeWeight(1);
            for (var i = 0; i <= 10; i++) {
                var bottom = this.y + this.height;
                var x = i / 10 * this.width + this.x;
                p.line(x * height, bottom * height, x * height, bottom * height + 5);
            }
            p.fill(0);
            p.textSize(10);
            p.textAlign(p.RIGHT);
            for (var i = 0; i <= this.vertSub; i++) {
                var bottom = this.x + this.width;
                var y = i / this.vertSub * this.height + this.y;
                p.line(bottom * height, y * height, this.x * height - 5, y * height);
                p.text(limDecimal(-i / this.vertSub * rangeSize + this.range[0], 1), this.x * height - 7, y * height + 3);
            }
        } // Axis drawing

        for (var x = 0; x < dWidth; x++) {
            var pt = this.data[x];
            var newX = xInc * x;
            var newY = rangeMult * pt * -1 + this.range[1] * rangeMult;
            p.strokeWeight(4);
            p.stroke(this.col);
            newX += this.x;
            newY += this.y + this.height;
            p.point(newX * height, newY * height);
        } // Data display

        {
            var pt = this.data[this.highlight];
            var newX = xInc * this.highlight;
            var newY = rangeMult * pt * -1 + this.range[1] * rangeMult;
            p.strokeWeight(4);
            p.stroke(255 - p.red(this.col), 255 - p.green(this.col), 255 - p.blue(this.col));
            newX += this.x;
            newY += this.y + this.height;
            p.point(newX * height, newY * height);
        } // Highlight

        
    }
};