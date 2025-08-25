import { AppAtOnceClient } from '../src';

// Initialize client with API key
const client = new AppAtOnceClient('your-api-key-here');

async function contentManagementExamples() {
  try {
    // 1. Create text content
    const textContent = await client.content.create({
      resourceId: 'project-id',
      resourceType: 'project',
      contentType: 'text',
      title: 'My First Content',
      content: {
        text: 'This is the content body',
        format: 'plain',
      },
      metadata: {
        author: 'John Doe',
        tags: ['example', 'demo'],
      },
    });
    console.log('Created text content:', textContent);

    // 2. Create image content using image editor
    const imageContent = await client.imageEditor.createImage({
      resourceId: 'project-id',
      resourceType: 'project',
      title: 'Marketing Banner',
      canvasData: {
        version: '2.0.0',
        objects: [
          {
            type: 'rect',
            left: 100,
            top: 100,
            width: 200,
            height: 100,
            fill: 'red',
          },
          {
            type: 'text',
            left: 200,
            top: 150,
            text: 'SALE 50% OFF',
            fontSize: 24,
            fill: 'white',
          },
        ],
        background: '#f0f0f0',
      },
      width: 1200,
      height: 630,
    });
    console.log('Created image content:', imageContent);

    // 3. Generate AI content
    const blogPost = await client.content.generateAI('blog_post', {
      topic: 'The Future of AI in Software Development',
      keywords: ['AI', 'automation', 'machine learning', 'coding'],
      tone: 'professional',
    });
    console.log('Generated blog post:', blogPost);

    // 4. Create content from template
    const fromTemplate = await client.imageEditor.createFromTemplate(
      'instagram-post-1',
      {
        resourceId: 'project-id',
        resourceType: 'project',
        title: 'Instagram Post - Summer Sale',
        elements: [
          {
            type: 'text',
            properties: {
              x: 50,
              y: 100,
              text: 'SUMMER SALE',
              fontSize: 48,
              color: '#FF0000',
            },
          },
          {
            type: 'text',
            properties: {
              x: 50,
              y: 200,
              text: '30% OFF Everything!',
              fontSize: 36,
              color: '#000000',
            },
          },
        ],
      }
    );
    console.log('Created from template:', fromTemplate);

    // 5. List all contents
    const contents = await client.content.getAll({
      resourceId: 'project-id',
      resourceType: 'project',
      contentType: 'image',
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    console.log('All image contents:', contents);

    // 6. Update content
    const updated = await client.content.update(textContent.id, {
      title: 'Updated Title',
      content: {
        text: 'Updated content body',
        format: 'markdown',
      },
    });
    console.log('Updated content:', updated);

    // 7. Export image in different formats
    const pngExport = await client.imageEditor.exportImage(imageContent.id, {
      format: 'png',
      scale: 2, // 2x resolution
      transparentBackground: true,
    });
    console.log('PNG export URL:', pngExport.url);

    // 8. Upload custom image
    const uploadResult = await client.imageEditor.uploadImage(
      'data:image/png;base64,iVBORw0KGgoAAAANS...', // Your base64 image
      'project-id',
      'project'
    );
    console.log('Uploaded image:', uploadResult);

    // 9. Generate AI image
    const aiImage = await client.imageEditor.generateImageAI(
      'A futuristic cityscape with flying cars',
      {
        style: 'photorealistic',
        size: '1024x1024',
        model: 'stable-diffusion',
      }
    );
    console.log('AI generated image:', aiImage);

    // 10. Archive content
    await client.content.archive(textContent.id);
    console.log('Content archived');

    // 11. Duplicate content
    const duplicated = await client.content.duplicate(imageContent.id);
    console.log('Duplicated content:', duplicated);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run examples
contentManagementExamples();