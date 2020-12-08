/*
class ChartImage {

    images = [];

    constructor(baseDir , id) {
        this.baseDir = baseDir;
        this.id = id;
    }

    // 画像は、最大3つまでの前提
    loadImages() {
        let self = this;
        return self.checkExists(1).then(function(path) {
            self.images.push(path);
            return self.checkExists(2);
        }).then(function(path) {
            self.images.push(path);
            return self.checkExists(3);
        }).then(function(path) {
            self.images.push(path);
        }).catch(function(path) {
            console.log(`${path} not found!!!` )
            return Promise.resolve();
        }).finally(function() {
            return Promise.resolve();
        });
    }

    checkExists(i) {
        let self = this;
        let baseDir = this.baseDir;
        let id = this.id;
        return new Promise(function(resolve, reject) {
            let path = `${baseDir}/${id}-${i}.jpg`;
            let img = new Image();
            img.src = path
            img.onload = function() {
                resolve(path);
            }
            img.onerror = function() {
                reject(path)
            }
        })    
    }

    getImages() {
        return this.images;
    }
}
*/

/*
let chartImage = new ChartImage('../vue/mrtnfx/upload' ,1);
chartImage.loadImages().then(function() {
    console.log(chartImage.getImages());
});
*/