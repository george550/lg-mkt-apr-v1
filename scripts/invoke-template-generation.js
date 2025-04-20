// Simple script to invoke the template generation endpoint

const fetchData = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/admin/generate-templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Templates generated successfully:', data);
  } catch (error) {
    console.error('Error invoking template generation:', error);
  }
};

fetchData();