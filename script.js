document.addEventListener("DOMContentLoaded", function() {
  fetch("result.json")
    .then(response => response.json())
    .then(data => {
      const productsContainer = document.getElementById("products-container");
      data.forEach(product => {
        const productDiv = document.createElement("div");
        productDiv.classList.add("product");

        const productName = document.createElement("div");
        productName.classList.add("name");
        productName.textContent = product.productName;
        productName.addEventListener("click", function() {
          window.open(product.url, "_blank");
        });

        const productPrices = document.createElement("div");
        productPrices.classList.add("prices");
        productPrices.innerHTML = `
          <p>Sale Price: <span class="base-price">${product.prices.basePrice}</span></p>
          <p>Base Price: ${product.prices.salePrice}</p>
        `;

        const productImage = document.createElement("img");
        productImage.src = product.image;
        productImage.addEventListener("click", function() {
          window.open(product.url, "_blank");
        });

        const productUrl = document.createElement("a");
        productUrl.classList.add("url");
        productUrl.textContent = "Product Link";
        productUrl.href = product.url;
        productUrl.target = "_blank";

        productDiv.appendChild(productImage);
        productDiv.appendChild(productName);
        productDiv.appendChild(productPrices);

        productsContainer.appendChild(productDiv);
      });
    })
    .catch(error => console.error("Error fetching data:", error));
});
