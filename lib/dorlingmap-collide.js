// Adapted from http://bl.ocks.org/3116713
let collide = function(alpha, nodes, scale, padding) {
    let quadtree = d3.geom.quadtree(nodes);
    return function(d) {
        let r = d.radius + scale.domain()[1] + padding;
        let nx1 = d.x - r;
        let nx2 = d.x + r;
        let ny1 = d.y - r;
        let ny2 = d.y + r;
        quadtree.visit(function(quad, x1, y1, x2, y2) {
            if (quad.point && quad.point !== d) {
                let x = d.x - quad.point.x;
                let y = d.y - quad.point.y;
                let l = Math.sqrt(x * x + y * y);
                let r = d.radius + quad.point.radius + padding;
                if (l < r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    quad.point.x += x;
                    quad.point.y += y;
                }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
    };
};

export default collide;