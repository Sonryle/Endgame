
// Returns URL of skin belonging to player of "username"
export async function stealSkinURL(username) {
    let response = await fetch(`/api/skin/${username}`)
    let data = await response.json();
    console.log("data = " + data);
    console.log("data.id = " + data.id);
}
