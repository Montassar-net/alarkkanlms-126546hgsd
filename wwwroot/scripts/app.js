function decodeJwt(token) {
  try {
    // JWTs are composed of three parts separated by dots: header, payload, and signature.
    const parts = token.split('.');

    if (parts.length !== 3) {
      throw new Error('Invalid JWT token format.');
    }

    // Decode the header (first part)
    const base64UrlHeader = parts[0];
    const decodedHeader = JSON.parse(atob(base64UrlHeader.replace(/-/g, '+').replace(/_/g, '/')));

    // Decode the payload (second part)
    const base64UrlPayload = parts[1];
    const decodedPayload = JSON.parse(atob(base64UrlPayload.replace(/-/g, '+').replace(/_/g, '/')));

    return {
      header: decodedHeader,
      payload: decodedPayload
    };
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}


document.getElementById('logoutButton').addEventListener('click', () => {
    logout();
});

function logout() {
    // Clear the JWT token from local storage
    localStorage.removeItem('token');

    // Redirect the user to the login page
    window.location.href = '/login.html'; // Replace with your login page URL
}