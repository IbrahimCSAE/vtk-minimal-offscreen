import '@kitware/vtk.js/Rendering/Profiles/Geometry';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';

async function performOffscreenRendering() {
  // Create offscreen render window
  const renderWindow = vtkRenderWindow.newInstance();
  const renderer = vtkRenderer.newInstance({ background: [0.2, 0.3, 0.4] });
  renderWindow.addRenderer(renderer);

  // Create OpenGL render window for offscreen rendering
  const openGLRenderWindow = vtkOpenGLRenderWindow.newInstance();
  renderWindow.addView(openGLRenderWindow);
  
  // Set size for offscreen rendering
  openGLRenderWindow.setSize(16384, 16384);
  
  // Important: Use offscreen canvas
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = 16384;
  offscreenCanvas.height = 16384;
  openGLRenderWindow.setCanvas(offscreenCanvas);

  // Create a cone
  const coneSource = vtkConeSource.newInstance({ 
    height: 1.0, 
    radius: 0.5, 
    resolution: 60 
  });
  
  const mapper = vtkMapper.newInstance();
  mapper.setInputConnection(coneSource.getOutputPort());

  const actor = vtkActor.newInstance();
  actor.setMapper(mapper);
  
  // Add the actor to the renderer
  renderer.addActor(actor);
  renderer.resetCamera();

  // Render the scene
  renderWindow.render();

  // Capture the rendered image
  const canvas = openGLRenderWindow.getCanvas();
  const dataURL = canvas.toDataURL('image/png');
  
  // Clean up
  openGLRenderWindow.delete();
  renderWindow.delete();
  
  return dataURL;
}

// Set up button click handler
document.getElementById('renderButton').addEventListener('click', async () => {
  const outputDiv = document.getElementById('output');
  outputDiv.innerHTML = '<p>Rendering...</p>';
  
  try {
    const imageDataURL = await performOffscreenRendering();
    
    // Display the rendered image
    outputDiv.innerHTML = `
      <h3>Offscreen Rendered Image:</h3>
      <img src="${imageDataURL}" alt="Rendered cone" />
      <p>Successfully rendered a cone using VTK.js offscreen rendering!</p>
    `;
  } catch (error) {
    outputDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    console.error('Rendering error:', error);
  }
});