"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageProcessingModule = void 0;
class ImageProcessingModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async processImage(source, options) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'image');
        }
        formData.append('options', JSON.stringify(options));
        const response = await this.httpClient.post('/image-processing/process', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async batchProcess(images, commonOptions) {
        const formData = new FormData();
        images.forEach((img, index) => {
            if (typeof img.source === 'string') {
                formData.append(`sources[${index}]`, img.source);
            }
            else {
                formData.append(`files[${index}]`, new Blob([img.source]), `image${index}`);
            }
            formData.append(`options[${index}]`, JSON.stringify(img.options));
        });
        if (commonOptions) {
            formData.append('commonOptions', JSON.stringify(commonOptions));
        }
        const response = await this.httpClient.post('/image-processing/batch', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async analyzeImage(source, options) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'image');
        }
        if (options) {
            formData.append('options', JSON.stringify(options));
        }
        const response = await this.httpClient.post('/image-processing/analyze', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async generateThumbnail(source, options) {
        return this.processImage(source, {
            resize: {
                width: options?.width || 200,
                height: options?.height || 200,
                fit: 'cover',
            },
            format: options?.format,
            quality: options?.quality,
        });
    }
    async convertFormat(source, format, options) {
        return this.processImage(source, {
            format,
            quality: options?.quality,
            compress: options?.compress,
        });
    }
    async optimizeForWeb(source, options) {
        return this.processImage(source, {
            resize: {
                width: options?.maxWidth,
                height: options?.maxHeight,
                fit: 'inside',
            },
            format: options?.format || 'webp',
            quality: options?.quality || 85,
            compress: true,
        });
    }
    async createVariants(source, variants) {
        const results = {};
        const promises = variants.map(async (variant) => {
            const processed = await this.processImage(source, {
                resize: {
                    width: variant.width,
                    height: variant.height,
                    fit: 'cover',
                },
                format: variant.format,
                quality: variant.quality,
            });
            results[variant.name] = processed;
        });
        await Promise.all(promises);
        return results;
    }
    async compareImages(image1, image2) {
        const formData = new FormData();
        if (typeof image1 === 'string') {
            formData.append('image1', image1);
        }
        else {
            formData.append('file1', new Blob([image1]), 'image1');
        }
        if (typeof image2 === 'string') {
            formData.append('image2', image2);
        }
        else {
            formData.append('file2', new Blob([image2]), 'image2');
        }
        const response = await this.httpClient.post('/image-processing/compare', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async extractColorPalette(source, count) {
        const analysis = await this.analyzeImage(source, { analyzeColors: true });
        return analysis.colors.palette.slice(0, count || 5).map(p => ({
            ...p,
            rgb: this.hexToRgb(p.color),
            hex: p.color,
        }));
    }
    async smartCrop(source, options) {
        const analysis = await this.analyzeImage(source, { detectFaces: true });
        const cropOptions = {
            width: options.width,
            height: options.height,
        };
        if (options.focusOn === 'faces' && analysis.faces && analysis.faces.length > 0) {
            const face = analysis.faces[0];
            cropOptions.x = Math.max(0, face.x - (options.width - face.width) / 2);
            cropOptions.y = Math.max(0, face.y - (options.height - face.height) / 2);
        }
        return this.processImage(source, { crop: cropOptions });
    }
    async createCollage(images, options) {
        const formData = new FormData();
        images.forEach((img, index) => {
            if (typeof img === 'string') {
                formData.append(`images[${index}]`, img);
            }
            else {
                formData.append(`files[${index}]`, new Blob([img]), `image${index}`);
            }
        });
        if (options) {
            formData.append('options', JSON.stringify(options));
        }
        const response = await this.httpClient.post('/image-processing/collage', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async applyFilter(source, filter, intensity) {
        const response = await this.httpClient.post('/image-processing/filter', {
            source: typeof source === 'string' ? source : source.toString('base64'),
            filter,
            intensity: intensity || 1.0,
        });
        return response.data;
    }
    async generatePlaceholder(options) {
        const response = await this.httpClient.post('/image-processing/placeholder', options);
        return response.data;
    }
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? [
                parseInt(result[1], 16),
                parseInt(result[2], 16),
                parseInt(result[3], 16),
            ]
            : [0, 0, 0];
    }
}
exports.ImageProcessingModule = ImageProcessingModule;
//# sourceMappingURL=image-processing.js.map