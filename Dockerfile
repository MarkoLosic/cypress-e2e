# Official Cypress image: Node.js + Cypress binary + Chrome, Firefox and Edge with all system dependencies.
# Keep the tag in sync with the cypress version in package-lock.json.
FROM cypress/included:16.1.1

WORKDIR /app
ENV CI=true

# Install dependencies first so this layer is cached until package files change.
# The Cypress binary is already cached in the image, so npm ci does not download it again.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# The base image's entrypoint is `cypress run`; reset it so any command can be passed
ENTRYPOINT []
CMD ["npx", "cypress", "run"]
