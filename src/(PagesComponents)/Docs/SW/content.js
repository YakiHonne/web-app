import slugify from "slugify";

export const swContent = {
  intro: {
    title: "What are smart widgets?",
    content: `# What are smart widgets?
Smart Widgets are interactive graphical components encapsulated as Nostr events, designed for seamless integration into applications. Each widget type serves a specific purpose, with well-defined structures and behaviors to support various use cases.

## Smart widget event structure
\`\`\`json
{
    "id": <event-id>,
    "pubkey": <hex-pubkey>,
    "content": <string-widget-title>,
    "kind": 30033,
    "tags": [
        ["client",<client-name>,<client-31190-data>],
        ["d", <unique-identifier>],
        ["l", <widget-type>],
        ["icon", <widget-icon-url>], // only for action/tool widgets
        ["image",<widget-thumbnail-image-url>],
        ["input",<input-label>], // optional input field component
        ["button", <label>, <type>, <url>],
        ...
        ["button", <label>, <type>, <url>]
    ]
}
\`\`\`
## Widget Types
### Basic Widget

- **Description:** A versatile widget comprising multiple UI components for flexible display and interaction.
- **Components:**
    - Images (mandatory, maximum of one).
    - Input Field (optional, maximum of one).
    - Buttons (optional, maximum of six).
- **Use Case:** Ideal for scenarios requiring a combination of visual elements and user inputs, such as forms or dashboards.

![image](https://yakihonne.s3.ap-east-1.amazonaws.com/media/icons-mono/65878d2452fe7cb730dad6a94c120df6b32a21916531ee7d61d76f24f5f976aa/files/1744436557264-YAKIHONNES3.jpg)

### Action Widget

- **Description:** A streamlined widget designed to trigger an action by embedding a URL in an iframe.
- **Components:**
    - Image (single, for visual representation).
    - Button (single, type: app).
- **Behavior:**
    - Clicking the button opens the specified URL within an iframe.
    - The iframe does not return any data to the parent application.
- **Use Case:** Suitable for launching external applications or resources without expecting a response, such as opening a third-party tool.

### Tool Widget

- **Description:** A widget that facilitates interaction with an external application via an iframe, with data exchange capabilities.
- **Components:**
    - Image (single, for visual representation).
    - Button (single, type: app).
- **Behavior:**
    - Clicking the button opens the specified URL within an iframe.
    - The iframe is configured to return data to the parent application upon interaction.
- **Use Case:** Perfect for scenarios requiring data retrieval or feedback from an external tool, such as a configuration interface or a data picker.

![image](https://yakihonne.s3.ap-east-1.amazonaws.com/media/icons-mono/65878d2452fe7cb730dad6a94c120df6b32a21916531ee7d61d76f24f5f976aa/files/1744437071492-YAKIHONNES3.jpg)

## Technical Notes

- **Nostr Event Structure:** Each widget is represented as a Nostr event, ensuring compatibility with the Nostr protocol for decentralized communication.
- **Iframe Integration:** For Action and Tool widgets, the iframe must adhere to standard web security practices (e.g., sandboxing, CORS policies) to ensure safe URL embedding.
- **Extensibility:** Developers can customize widget appearance and behavior within the defined constraints (e.g., maximum button limits, single input field) to align with application requirements.

## Why Use Smart Widgets (Action & Tool Types)?

Smart Widgets, built as Nostr events, enhance applications with interactive, interoperable components. Here’s why developers should leverage them:

1. **Interactive Feed Embeds:** Embed applications as dynamic widgets in user feeds, enabling seamless and interactive engagement.
2. **Host App Communication:** Tool Widgets enable data exchange via iframes, integrating tightly with the host application.
3. **Launch with Metadata:** Open apps with user metadata (e.g., public key) for streamlined onboarding.
4. **Proxy Nostr Events:** Allow the host to sign/publish events on users’ behalf, simplifying interactions.
5. **Quick-Access Saving:** Let users save widgets for one-tap access, boosting retention.
6. **Boost Discoverability:** Surface apps in search and social feeds via optimized widget metadata.
`,
    subtitles: [
      {
        title: "Smart widget event structure",
        id: slugify("Smart widget event structure", {
          lower: true,
          strict: true,
        }),
        subtitles: [],
      },
      {
        title: "Widget Types",
        id: slugify("Widget Types", { lower: true, strict: true }),
        subtitles: [
          {
            title: "Basic Widget",
            id: slugify("Basic Widget", { lower: true, strict: true }),
          },
          {
            title: "Action Widget",
            id: slugify("Action Widget", { lower: true, strict: true }),
          },
          {
            title: "Tool Widget",
            id: slugify("Tool Widget", { lower: true, strict: true }),
          },
        ],
      },
      {
        title: "Technical Notes",
        id: slugify("Technical Notes", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Why Use Smart Widgets (Action & Tool Types)?",
        id: slugify("Why Use Smart Widgets (Action & Tool Types)?", {
          lower: true,
          strict: true,
        }),
        subtitles: [],
      },
    ],
  },
  "getting-started": {
    title: "Getting started",
    content: `# Getting started

Smart Widgets—Basic, Action, and Tool—enable interactive, Nostr-powered components for your applications. Below is a streamlined guide to creating and integrating them, tailored for developers and Nostr client implementers.

### Creating Basic Widgets
Basic Widgets combine visuals (images), an optional input, and up to six buttons.

- **No-Code Path**:
  Use the [YakiHonne Widget Editor](https://yakihonne.com/smart-widget-builder) to build static or dynamic widgets without coding. Choose from template endpoints or link a custom REST API that outputs valid widget JSON.

- **Code-First Path**:
  Build a custom API for full control. Install our helper package:
  \`\`\`bash
  npm install smart-widget-builder
  \`\`\`
  Or jumpstart with our boilerplate:
  \`\`\`bash
  git clone https://github.com/YakiHonne/sw-dynamic-api.git
  cd sw-dynamic-api
  npm install
  npm run dev
  \`\`\`
  Modify the API to generate widget data for your use case.

### Building Action & Tool Widgets
Action Widgets open URLs in iframes (no data return), while Tool Widgets support data exchange.

1. **Craft Your App**: Develop a new app or repurpose a FOSS project.
2. **Add Nostr Support**: Integrate our SDK to offload Nostr tasks to the host:
   \`\`\`bash
   npm install smart-widget-handler
   \`\`\`
3. **Test Locally**: Debug with the [YakiHonne Playground](https://yakihonne.com/sw-playground) against a live Nostr client.
4. **Expose Metadata**: Place a \`widget.json\` file at \`/.well-known/widget.json\` on your public domain.
5. **Go Live**: Deploy your app and publish it via the [YakiHonne Widget Editor](https://yakihonne.com/smart-widget-builder) , selecting “Action” or “Tool.”

### Supporting Widgets in Nostr Clients
Enhance your Nostr client with widget compatibility:

- **Handle Widget Interactions**:
  \`\`\`bash
  npm install smart-widget-handler
  \`\`\`
  Enables communication with embedded widgets.

- **Display Widget Events**:
  \`\`\`bash
  npm install smart-widget-previewer
  \`\`\`
  Renders Nostr widget events in your client’s UI.

### Pro Tips
- **Validation**: Ensure APIs and manifests conform to Smart Widget specs to avoid runtime errors.
- **Security**: Sandbox iframes and sanitize data to protect users.
- **Performance**: Optimize widget payloads for fast rendering in feeds.

    `,
    subtitles: [
      {
        title: "Creating Basic Widgets",
        id: slugify("Creating Basic Widgets", {
          lower: true,
          strict: true,
        }),
        subtitles: [],
      },
      {
        title: "Building Action & Tool Widgets",
        id: slugify("Building Action & Tool Widgets", {
          lower: true,
          strict: true,
        }),
        subtitles: [],
      },
      {
        title: "Supporting Widgets in Nostr Clients",
        id: slugify("Supporting Widgets in Nostr Clients", {
          lower: true,
          strict: true,
        }),
        subtitles: [],
      },
      {
        title: "Pro Tips",
        id: slugify("Pro Tips", {
          lower: true,
          strict: true,
        }),
        subtitles: [],
      },
    ],
  },
  "basic-widgets": {
    title: "Basic widgets",
    content: `# Basic widgets 

This guide shows how to build dynamic Nostr smart widgets using the \`smart-widget-builder\` package.

## Basic Structure

A basic Smart Widget server needs:

1. Express routes for each widget state
2. Smart Widget component creation and signing
3. Image generation for visual content
4. Proper event response handling

## Example

Here's a simple example of a "Weather Widget" that displays current weather based on user location:

\`\`\`javascript
const express = require("express");
const { SW, Button, Image, SWComponentsSet } = require("smart-widget-builder");
const router = express.Router();
const axios = require("axios");
const WeatherImage = require("../Painter/WeatherPainter");

// Root endpoint - Entry point for the smart widget
router.post("/", async (req, res) => {
  try {
    // Initialize Smart Widget instance
    let SMART_WIDGET = new SW();

    // Create welcome image and buttons
    let SWImage = new Image("https://example.com/weather-widget-welcome.png");
    
    // Button that posts to the /weather endpoint
    let SWButton = new Button(
      1,
      "Check Weather 🌤️",
      "post",
      getMainURL() + "/weather"
    );

    // Create component set with image and button
    let SWComp = new SWComponentsSet([SWImage, SWButton]);

    // Unique identifier for this widget (important for root widget)
    let identifier = "weather-widget-root-12345";

    // Sign the event
    let signedEvent = await SMART_WIDGET.signEvent(
      SWComp,
      "Weather Widget",
      identifier
    );

    // Publish only in production (only for root widget)
    let publishedEvent;
    if (import.meta.env.NODE_ENV === "production") {
      publishedEvent = await SMART_WIDGET.publish(
        SWComp,
        "Weather Widget",
        identifier
      );
    }

    // Return the signed event
    res.send(publishedEvent ? publishedEvent.event : signedEvent.event);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server error" });
  }
});

// Weather endpoint - Returns weather data based on location
router.post("/weather", async (req, res) => {
  try {
    // Extract parameters from request
    const { input, pubkey, aTag } = req.body;
    
    // Use input from previous widget or default
    const location = input || "New York";
    
    // Log user information (optional)
    console.log(\`Request from user: \$\{pubkey\}\`);
    console.log(\`Widget aTag: \$\{aTag\}\`);
    
    // Initialize Smart Widget
    let SMART_WIDGET = new SW();

    // Fetch weather data from API
    let weather = await axios.get(
      \`https://api.weatherapi.com/v1/current.json?key=YOUR_API_KEY&q=\$\{location\}\`
    );

    // Generate a weather image using custom painter
    let weatherImage = await WeatherImage({
      location: weather.data.location.name,
      temperature: weather.data.current.temp_c,
      condition: weather.data.current.condition.text,
      icon: weather.data.current.condition.icon
    });

    // Create image component with base64 encoded image
    let SWImage = new Image(
      \`data:image/png;base64,\$\{weatherImage.toString("base64")\}\`
    );

    // Button to check another location
    let SWButton = new Button(
      1,
      "Check Another Location 🔄",
      "post",
      getMainURL() + "/weather"
    );

    // Create component set
    let SWComp = new SWComponentsSet([SWImage, SWButton]);

    // Sign the event (note: no identifier and no publishing)
    let signed = await SMART_WIDGET.signEvent(SWComp, "Weather Widget");

    // Return signed event
    res.send(signed.event);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server error" });
  }
});

module.exports = router;
\`\`\`

### Image Painter Example (WeatherPainter.js)

\`\`\`javascript
const { genImage } = require("../Helpers/Helper");

const getWeatherHtml = (data) => {
  return \`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Widget</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            color: white;
        }
        * {
            box-sizing: border-box;
        }
    </style>
</head>
<body>
    <div style="width: 800px; min-height: 600px; background-color: #2c3e50;">
        <div style="width: 100%; min-height: 600px; display: flex; justify-content: center; align-items: center; position: relative; overflow: hidden; padding: 3rem">
            <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 120%; height: 120%; filter: blur(6px); background-size: cover; overflow: hidden; background-position: center; background-image: url(\$\{data.icon\}); z-index: 0;"></div>
           
            <div style="width: 100%; position: relative; z-index: 2; display: flex; justify-content: center; flex-direction: column; gap: 20px; align-items: center; padding: 40px; border-radius: 30px; background-color: rgba(255, 255, 255, 0.9)">
                <h1 style="font-size: 48px; text-align: center; margin: 0; color: #2c3e50">\$\{data.location\}</h1>
                <h2 style="font-size: 72px; text-align: center; margin: 0; color: #3498db">\$\{data.temperature\}°C</h2>
                <p style="font-size: 28px; text-align: center; margin: 0; color: #34495e">\$\{data.condition\}</p>
            </div>
        </div>
    </div>
</body>
</html>
  \`;
};

/**
 * Generate a weather image
 * @param {*} data Weather data to be used in an HTML code to render dynamic images
 * @returns an image buffer
 */
module.exports = async (data) => {
  try {
    let buffer = await genImage(getWeatherHtml(data));
    return buffer;
  } catch (error) {
    return false;
  }
};
\`\`\`

## Key Principles

1. **Every endpoint must return a valid signed Nostr smart widget event (kind:30033)**
   - Always use \`SMART_WIDGET.signEvent()\` and return the event

2. **Only publish the root widget to Nostr relays**
   - Use \`SMART_WIDGET.publish()\` only for the entry-point widget
   - Only publish in production environments

3. **Don't publish secondary widgets**
   - Child widgets (other endpoints) should only be signed, not published
   - This prevents relay spam and maintains a cleaner event graph

4. **Generate dynamic images for data visualization**
   - Use Puppeteer or Canvas to render visualizations
   - HTML templates provide flexibility for creating rich visuals

5. **Image handling options**
   - Return images as base64 strings directly in the widget
   - Or upload to storage and reference by URL

6. **Component Organization**
   - Use \`SWComponentsSet\` to organize widget elements
   - Follow the pattern: Image → Input (optional) → Buttons (up to 6)

7. **Request Parameters Handling**
   - POST requests to widget endpoints may contain the following standard parameters:
     - \`input\`: Contains data submitted through input fields from the preceding widget
     - \`pubkey\`: Represents the Nostr public key of the end user interacting with the widget
     - \`aTag\`: Contains the canonical reference to the root widget in the format \`"30033:<author-pubkey>:<widget-identifier>"\` for maintaining widget hierarchy context

## Environment Setup

Create a \`.env\` file with your configuration:

\`\`\`
NODE_ENV=development
SECRET_KEY=your_nostr_private_key_hex
PROTOCOL=https
DOMAIN=your-domain.com
\`\`\`

Important environment variables:
- \`SECRET_KEY\`: Your Nostr private key (hex format) for signing events
- \`NODE_ENV\`: Set to 'production' when deploying
- \`PROTOCOL\` and \`DOMAIN\`: Used to construct callback URLs in production

## Advanced Features

For more complex widgets, you can:
- Add input fields for user data
- Include multiple buttons with different actions
- Chain multiple widget states together
- Integrate with external APIs for dynamic content

## Notes

- Ensure all endpoints respond quickly (< 5 seconds)
- Keep image sizes reasonable for quick loading
- Test thoroughly in a Nostr client that supports Smart Widgets

## Quick tutorial

<iframe style="aspect-ratio:16/9; width:100%; border-radius:10px" src="https://www.youtube.com/embed/_37Dj5GxGj8" title="Dawn of Persia - Rhythmic Ancient Persian Inspired Ambient Music" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    `,
    subtitles: [
      {
        title: "Basic Structure",
        id: slugify("Basic Structure", {
          lower: true,
          strict: true,
        }),
        subtitles: [],
      },
      {
        title: "Example",
        id: slugify("Example", {
          lower: true,
          strict: true,
        }),
        subtitles: [
          {
            title: "Image Painter Example (WeatherPainter.js)",
            id: slugify("Image Painter Example (WeatherPainter.js)", {
              lower: true,
              strict: true,
            }),
          },
        ],
      },
      {
        title: "Key Principles",
        id: slugify("Key Principles", {
          lower: true,
          strict: true,
        }),
        subtitles: [],
      },
      {
        title: "Environment Setup",
        id: slugify("Environment Setup", {
          lower: true,
          strict: true,
        }),
        subtitles: [],
      },
      {
        title: "Advanced Features",
        id: slugify("Advanced Features", {
          lower: true,
          strict: true,
        }),
        subtitles: [],
      },
      {
        title: "Notes",
        id: slugify("Notes", {
          lower: true,
          strict: true,
        }),
        subtitles: [],
      },
      {
        title: "Quick tutorial",
        id: slugify("Quick tutorial", {
          lower: true,
          strict: true,
        }),
        subtitles: [],
      },
    ],
  },
  "action-tool-widgets": {
    title: "Action/Tool widgets",
    content: `# Action/Tool widgets

This guide explains how to build mini web applications that can be converted into Nostr smart widgets using the \`smart-widget-handler\` package.

## Overview

Smart Widget Mini Apps are lightweight web applications that extend functionality within Nostr clients. They run in their own context but can communicate with the host Nostr client to provide seamless integration.

## Types of Mini Apps

Nostr clients recognize two types of mini apps:

### Action Mini Apps
- **Purpose**: Perform actions with data from the Nostr client
- **Data flow**: One-way (client → mini app)
- **Use case**: Mini games, formatting tools

### Tool Mini Apps
- **Purpose**: Process data and return results to the Nostr client
- **Data flow**: Two-way (client ↔ mini app)
- **Use case**: Text generators, data analysis, content lookup

> 📌 **Note**: The distinction between \`Action\` and \`Tool\` is primarily to help Nostr clients handle the widget's UI and data flow appropriately and to provide the necessary UX for each type.

## Quick Start

Create a new project:

\`\`\`bash
mkdir my-nostr-widget
cd my-nostr-widget
npm init -y
npm install react react-dom smart-widget-handler
npm install -D vite @vitejs/plugin-react
\`\`\`

Create a basic structure:

\`\`\`
my-nostr-widget/
├── public/
│   └── .well-known/
│       └── widget.json
├── src/
│   ├── App.jsx
│   └── main.jsx
└── package.json
\`\`\`


## Integration with Host App

The \`smart-widget-handler\` package provides a bridge for communication between your mini app and the host application.

### Installation

If not installed

\`\`\`bash
npm install smart-widget-handler
\`\`\`

### Basic Usage

\`\`\`javascript
import SWhandler from "smart-widget-handler";

// Initialize communication with host app
useEffect(() => {
  SWhandler.client.ready();
}, []);

// Listen for messages from host app
useEffect(() => {
  let listener = SWhandler.client.listen((event) => {
    if (event.kind === "user-metadata") {
      // Handle user metadata
      setUserMetadata(event.data?.user);
      setHostOrigin(event.data?.host_origin);
    }
    if (event.kind === "err-msg") {
      // Handle error messages
      setErrorMessage(event.data);
    }
    if (event.kind === "nostr-event") {
      // Handle Nostr events
      const { pubkey, id } = event.data?.event || {};
      // Process event data
    }
  });

  return () => {
    // Clean up listener when component unmounts
    listener?.close();
  }
}, []);
\`\`\`

## Action Mini Apps vs. Tool Mini Apps

### Action Mini Apps. Exp

Action mini apps can only receive data from the host application. They are ideal for widgets that perform a specific action without needing to return data.

Example:
\`\`\`javascript
// In an Action Mini App
import SWhandler from "smart-widget-handler";

function ActionApp() {
  const [userMetadata, setUserMetadata] = useState(null);
  
  useEffect(() => {
    SWhandler.client.ready();
    
    const listener = SWhandler.client.listen((event) => {
      if (event.kind === "user-metadata") {
        setUserMetadata(event.data?.user);
      }
    });
    
    return () => listener?.close();
  }, []);
  
  return (
    <div>
      {userMetadata ? (
        <div>
          <h1>Hello, {userMetadata.display_name || userMetadata.name}</h1>
          <button onClick={performAction}>Perform Action</button>
        </div>
      ) : (
        <div>Loading user data...</div>
      )}
    </div>
  );
}
\`\`\`

### Tool Mini Apps. Exp

Tool mini apps can both receive data from and return data to the host application. This makes them suitable for widgets that need to provide information back to the host app.

Example:
\`\`\`javascript
// In a Tool Mini App
import SWhandler from "smart-widget-handler";

function ToolApp() {
  const [userMetadata, setUserMetadata] = useState(null);
  const [hostOrigin, setHostOrigin] = useState(null);
  
  useEffect(() => {
    SWhandler.client.ready();
    
    const listener = SWhandler.client.listen((event) => {
      if (event.kind === "user-metadata") {
        setUserMetadata(event.data?.user);
        setHostOrigin(event.data?.host_origin);
      }
    });
    
    return () => listener?.close();
  }, []);
  
  const sendDataToHost = (data) => {
    if (hostOrigin) {
      // Send context data back to the host app
      SWhandler.client.sendContext(data, hostOrigin);
    }
  };
  
  return (
    <div>
      {userMetadata ? (
        <div>
          <h1>Hello, {userMetadata.display_name || userMetadata.name}</h1>
          <button onClick={() => sendDataToHost("This is data from the tool mini app")}>
            Send Data to Host
          </button>
        </div>
      ) : (
        <div>Loading user data...</div>
      )}
    </div>
  );
}
\`\`\`

## Publishing Nostr Events

Mini apps can request the host application to sign and publish Nostr events:

\`\`\`javascript
const signEvent = (tempEvent) => {
  if (hostOrigin) {
    SWhandler.client.requestEventPublish(tempEvent, hostOrigin);
  }
};

// Example of creating and publishing a simple note
const publishNote = () => {
  const eventTemplate = {
    kind: 1, // Regular note
    content: "Hello from my mini app!",
    tags: [["t", "miniapp"], ["t", "test"]]
  };
  
  signEvent(eventTemplate);
};
\`\`\`

## Widget Manifest

To make your mini app discoverable as a widget, you need to create a manifest file at \`/.well-known/widget.json\`:

\`\`\`json
{
  "pubkey": "your-nostr-pubkey-in-hex",
  "widget": {
    "title": "My Amazing Widget",
    "appUrl": "https://your-app-url.com",
    "iconUrl": "https://your-app-url.com/icon.png",
    "imageUrl": "https://your-app-url.com/thumbnail.png",
    "buttonTitle": "Launch Widget",
    "tags": ["tool", "utility", "nostr"]
  }
}
\`\`\`

This manifest serves two important purposes:
1. Verifies the authenticity of your mini app
2. Provides metadata for Nostr clients to display your widget

## Deployment and Publication Workflow

1. **Build your mini app**
2. **Deploy to a hosting service**
   - Vercel, Netlify, GitHub Pages, etc.
   - Ensure the \`/.well-known/widget.json\` file is accessible

3. **Register with YakiHonne Widget Editor**
   - Go to the [YakiHonne Widget Editor](https://yakihonne.com/smart-widget-builder)
   - Select \`Action\` or \`Tool\` based on your mini app type
   - Enter your mini app URL
   - The editor will fetch your manifest and validate it
   - Configure any additional settings
   - Publish to Nostr

## Benefits of Mini Apps

- **Web3/Web2/Nostr Integration**: Create apps that bridge different ecosystems
- **FOSS Projects**: Leverage open-source libraries and frameworks
- **Customizability**: Build widgets to suit specific needs
- **Discoverability**: Widget manifest makes your mini apps discoverable

## Common Use Cases

### Action Mini Apps
- Note composers with special formatting
- Media uploaders
- Event creators
- NFT minters
- Payment widgets

### Tool Mini Apps
- Analytics providers
- Search tools
- Data aggregators
- Content recommendation engines
- Information lookup services


## Quick tutorials

<iframe style="aspect-ratio:16/9; width:100%; border-radius:10px" src="https://www.youtube.com/embed/SS-5N-LVCPM" title="Dawn of Persia - Rhythmic Ancient Persian Inspired Ambient Music" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
<iframe style="aspect-ratio:16/9; width:100%; border-radius:10px" src="https://www.youtube.com/embed/4NfMqjkRKnQ" title="Dawn of Persia - Rhythmic Ancient Persian Inspired Ambient Music" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
<iframe style="aspect-ratio:16/9; width:100%; border-radius:10px" src="https://www.youtube.com/embed/VGCEEGfIo_I" title="Dawn of Persia - Rhythmic Ancient Persian Inspired Ambient Music" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    `,
    subtitles: [
      {
        title: "Overview",
        id: slugify("Overview", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Types of Mini Apps",
        id: slugify("Types of Mini Apps", { lower: true, strict: true }),
        subtitles: [
          {
            title: "Action Mini Apps",
            id: slugify("Action Mini Apps", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Tool Mini Apps",
            id: slugify("Tool Mini Apps", {
              lower: true,
              strict: true,
            }),
          },
        ],
      },
      {
        title: "Quick Start",
        id: slugify("Quick Start", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Integration with Host App",
        id: slugify("Integration with Host App", { lower: true, strict: true }),
        subtitles: [
          {
            title: "Installation",
            id: slugify("Installation", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Basic Usage",
            id: slugify("Basic Usage", {
              lower: true,
              strict: true,
            }),
          },
        ],
      },
      {
        title: "Action Mini Apps vs. Tool Mini Apps",
        id: slugify("Action Mini Apps vs. Tool Mini Apps", {
          lower: true,
          strict: true,
        }),
        subtitles: [
          {
            title: "Action Mini Apps. Exp",
            id: slugify("Action Mini Apps. Exp", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Tool Mini Apps. Exp",
            id: slugify("Tool Mini Apps. Exp", {
              lower: true,
              strict: true,
            }),
          },
        ],
      },
      {
        title: "Publishing Nostr Events",
        id: slugify("Publishing Nostr Events", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Widget Manifest",
        id: slugify("Widget Manifest", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Deployment and Publication Workflow",
        id: slugify("Deployment and Publication Workflow", {
          lower: true,
          strict: true,
        }),
        subtitles: [],
      },
      {
        title: "Benefits of Mini Apps",
        id: slugify("Benefits of Mini Apps", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Common Use Cases",
        id: slugify("Common Use Cases", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Quick tutorials",
        id: slugify("Quick tutorials", { lower: true, strict: true }),
        subtitles: [],
      },
    ],
  },
  "smart-widget-builder": {
    title: "Smart widget builder",
    content: `# Smart widget builder

A Node.js package for creating and managing Nostr Smart Widgets \`kind:30033\`. Build widgets that can be embedded in Nostr clients with interactive elements like buttons, inputs, and images.

## Installation

\`\`\`bash
npm install smart-widget-builder
\`\`\`

or

\`\`\`bash
yarn add smart-widget-builder
\`\`\`

## Overview

Smart Widget Builder helps you create standardized Nostr widgets \`kind:30033\` with various components:

- **Images**: Display images in your widget
- **Icons**: Show icons (recommended for action/tool widgets)
- **Inputs**: Add input fields for user data entry
- **Buttons**: Create interactive buttons with different actions (redirect, nostr, zap, post, app)

The package supports three types of widgets:
- **Basic**: Standard widgets with multiple components
- **Action**: Simplified widgets for specific actions 
- **Tool**: Tool-type widgets for utility functions

## Usage

### Import

\`\`\`javascript
const { 
  SW, 
  SWComponentsSet, 
  Image, 
  Icon, 
  Input, 
  Button, 
  DEFAULT_RELAYS 
} = require('smart-widget-builder');
\`\`\`

## Basic Example

\`\`\`javascript
const { 
  SW, 
  SWComponentsSet, 
  Image, 
  Button, 
  Input 
} = require('smart-widget-builder');

// Create a widget and publish it
async function createBasicWidget() {
  try {
    // Create a new Smart Widget instance
    const smartWidget = new SW(
      'basic', // type: 'basic' | 'action' | 'tool'
      undefined, // use default relays
      import.meta.env.NOSTR_SECRET_KEY // your secret key, optional
    );
    
    // Initialize connection to relays
    await smartWidget.init();
    
    // Create widget components
    const widgetImage = new Image('https://example.com/my-widget-image.jpg');
    const widgetInput = new Input('Enter your name');
    const submitButton = new Button(1, 'Submit', 'post', 'https://api.example.com/submit');
    const profileButton = new Button(2, 'View Profile', 'nostr', 'nostr:npub1...');
    
    // Combine components into a set
    const componentsSet = new SWComponentsSet(
      [widgetImage, widgetInput, submitButton, profileButton],
      smartWidget
    );
    
    // Publish the widget
    const result = await smartWidget.publish(
      componentsSet,
      'My First Smart Widget',
      'unique-identifier-123', // optional
      5000 // timeout in ms
    );
    
    // Get the naddr (Nostr address) for sharing
    console.log('Widget created successfully!');
    console.log('Nostr Address:', result.naddr);
    console.log('Event ID:', result.event.id);
    
    return result;
  } catch (err) {
    console.error('Error creating widget:', err.message);
    throw err;
  }
}

// Run the function
createBasicWidget()
  .then(result => {
    console.log('Widget creation complete');
  })
  .catch(err => {
    console.error('Failed to create widget:', err);
  });
\`\`\`

## Components API

### Smart Widget (SW)

The main class for creating and managing widget instances.

\`\`\`javascript
// Create a new Smart Widget
const smartWidget = new SW(
  'basic',                  // Widget type ('basic', 'action', or 'tool')
  ['wss://relay1.com'],     // Optional custom relay set
  'your-hex-secret-key'     // Optional secret key for signing
);

// Initialize connection to relays (required before publishing)
await smartWidget.init();
\`\`\`

### Image Component

Main visual element for the widget.

\`\`\`javascript
// Create an image component
const widgetImage = new Image('https://example.com/image.jpg');

// Can also use data URLs
const dataUrlImage = new Image('data:image/png;base64,iVBORw0KGgo...');
\`\`\`

### Icon Component

A 1:1 ratio icon image (required for 'action' and 'tool' widget types).

\`\`\`javascript
// Create an icon component
const widgetIcon = new Icon('https://example.com/icon.png');
\`\`\`

### Input Component

Text input field for user data entry.

\`\`\`javascript
// Create an input component with placeholder/label
const widgetInput = new Input('Enter your search term...');
\`\`\`

### Button Component

Interactive button for taking actions.

\`\`\`javascript
// Create button components
// Format: index, label, type, url

// Regular link button
const linkButton = new Button(1, 'Visit Site', 'redirect', 'https://example.com');

// Nostr action button (can use nostr: URLs or npub/note/etc identifiers)
const nostrButton = new Button(2, 'View Profile', 'nostr', 'nostr:npub1...');

// Zap button (accepts Lightning addresses)
const zapButton = new Button(3, 'Zap Me', 'zap', 'user@lightning.address');

// Post data button
const postButton = new Button(4, 'Submit', 'post', 'https://api.example.com/endpoint');

// App action button
const appButton = new Button(5, 'Open App', 'app', 'https://app.example.com');
\`\`\`

### Component Set

Group components together to form a complete widget.

\`\`\`javascript
// Create a components set
const componentsSet = new SWComponentsSet(
  [widgetImage, widgetIcon, widgetInput, linkButton, nostrButton],
  smartWidget  // The SW instance
);
\`\`\`

## Publishing Widgets

Publish a widget to Nostr relays:

\`\`\`javascript
// Publish the widget to relays
const result = await smartWidget.publish(
  componentsSet,           // SWComponentsSet instance
  'My Widget Title',       // Optional title
  'unique-identifier',     // Optional unique identifier
  5000                     // Optional timeout in milliseconds
);

console.log('Widget published!');
console.log('Event ID:', result.event.id);
console.log('Nostr Address:', result.naddr);
\`\`\`

## Signing Without Publishing

Sign a widget event without publishing:

\`\`\`javascript
// Just sign the event without publishing
const signedEvent = await smartWidget.signEvent(
  componentsSet,           // SWComponentsSet instance
  'My Widget Title',       // Optional title
  'unique-identifier'      // Optional unique identifier
);

console.log('Signed event:', signedEvent.event);
console.log('Nostr Address:', signedEvent.naddr);
\`\`\`

## Searching In Nostr

Search Nostr for widgets or other events:

\`\`\`javascript
// Example: search for widgets with a specific tag
const results = await smartWidget.searchNostr([
  {
    kinds: [30033],
    "#t": ["widget"]
  }
]);

console.log('Found events:', results.data);
console.log('Related pubkeys:', results.pubkeys);
\`\`\`

## Widget Types and Constraints

Different widget types have different component constraints:

### Basic Widget
- Required: 1 Image component
- Optional: Up to 1 Input component
- Optional: Up to 6 Button components with consecutive indices

### Action/Tool Widget
- Required: 1 Image component
- Required: 1 Icon component 
- Special case: 1 Button of type 'app'

## API Reference

### SW (Smart Widget)

| Method | Description | Parameters |
|--------|-------------|------------|
| \`constructor(type, relaySet, secretKey)\` | Create a new widget instance | \`type\`: Widget type ('basic', 'action', 'tool')<br>\`relaySet\`: Array of relay URLs (optional)<br>\`secretKey\`: Hex private key (optional) |
| \`init()\` | Initialize connection to relays | None |
| \`getProps()\` | Get widget instance properties | None |
| \`publish(components, title, identifier, timeout)\` | Publish widget to relays | \`components\`: SWComponentsSet instance<br>\`title\`: Widget title (optional)<br>\`identifier\`: Unique ID (optional)<br>\`timeout\`: Timeout in ms (optional) |
| \`signEvent(components, title, identifier)\` | Sign event without publishing | \`components\`: SWComponentsSet instance<br>\`title\`: Widget title (optional)<br>\`identifier\`: Unique ID (optional) |
| \`searchNostr(filter)\` | Search Nostr for events | \`filter\`: Nostr filter array |

### Components

| Component | Constructor | Description |
|-----------|-------------|-------------|
| \`Image(url)\` | \`url\`: Image URL | Main widget image |
| \`Icon(url)\` | \`url\`: Icon URL | 1:1 icon (for action/tool widgets) |
| \`Input(label)\` | \`label\`: Input label/placeholder | Text input field |
| \`Button(index, label, type, url)\` | \`index\`: Position (1-6)<br>\`label\`: Button text<br>\`type\`: Button type<br>\`url\`: Target URL | Interactive button |
| \`SWComponentsSet(components, swInstance)\` | \`components\`: Array of components<br>\`swInstance\`: SW instance | Group of widget components |

### Button Types

| Type | Description | URL Format |
|------|-------------|------------|
| \`redirect\` | Standard link | http:// or https:// URL |
| \`nostr\` | Nostr action | nostr: URL or npub/note/etc |
| \`zap\` | Lightning payment | Email address or lnurl/lnbc |
| \`post\` | Form submission | http:// or https:// endpoint |
| \`app\` | App integration | http:// or https:// URL |


## Configuration
Create a .env file for the secret key, this will be used as a fallback if the SW() constructor was not provided with one to sign and publish event
\`\`\`
SECRET_KEY=your-hex-secret-key
\`\`\`
    `,
    subtitles: [
      {
        title: "Installation",
        id: slugify("Installation", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Overview",
        id: slugify("Overview", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Usage",
        id: slugify("Usage", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Basic Example",
        id: slugify("Basic Example", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Components API",
        id: slugify("Components API", { lower: true, strict: true }),
        subtitles: [
          {
            title: "Smart Widget (SW)",
            id: slugify("Smart Widget (SW)", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Image Component",
            id: slugify("Image Component", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Icon Component",
            id: slugify("Icon Component", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Input Component",
            id: slugify("Input Component", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Button Component",
            id: slugify("Button Component", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Component Set",
            id: slugify("Component Set", {
              lower: true,
              strict: true,
            }),
          },
        ],
      },
      {
        title: "Publishing Widgets",
        id: slugify("Publishing Widgets", {
          lower: true,
          strict: true,
        }),
        subtitles: [],
      },
      {
        title: "Signing Without Publishing",
        id: slugify("Signing Without Publishing", {
          lower: true,
          strict: true,
        }),
        subtitles: [],
      },
      {
        title: "Searching In Nostr",
        id: slugify("Searching In Nostr", {
          lower: true,
          strict: true,
        }),
        subtitles: [],
      },
      {
        title: "Widget Types and Constraints",
        id: slugify("Widget Types and Constraints", {
          lower: true,
          strict: true,
        }),
        subtitles: [
          {
            title: "Basic Widget",
            id: slugify("Basic Widget", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Action/Tool Widget",
            id: slugify("Action/Tool Widget", {
              lower: true,
              strict: true,
            }),
          },
        ],
      },
      {
        title: "API Reference",
        id: slugify("API Reference", {
          lower: true,
          strict: true,
        }),
        subtitles: [
          {
            title: "SW (Smart Widget)",
            id: slugify("SW (Smart Widget)", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Components",
            id: slugify("Components", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Button Types",
            id: slugify("Button Types", {
              lower: true,
              strict: true,
            }),
          },
        ],
      },
      {
        title: "Configuration",
        id: slugify("Configuration", {
          lower: true,
          strict: true,
        }),
        subtitles: [],
      },
    ],
  },
  "smart-widget-previewer": {
    title: "Smart widget previewer",
    content: `# Smart widget previewer

A React component for previewing and interacting with Nostr Smart Widgets \`kind:30033\`. This package allows you to easily display smart widgets in your React applications with full interaction support.

## Installation

\`\`\`bash
npm install smart-widget-previewer
\`\`\`

or

\`\`\`bash
yarn add smart-widget-previewer
\`\`\`

## Overview

Smart Widget Previewer renders Nostr Smart Widgets \`kind:30033\` in your React applications, supporting all widget features:

- **Basic widgets** with images, inputs, and multiple buttons
- **Action/Tool widgets** with specialized behavior
- **Interactive buttons** for various purposes (redirect, nostr, zap, post, app)
- **Dynamic content updates** when interacting with post-type buttons

## Basic Example

\`\`\`jsx
import React from 'react';
import { Widget } from 'smart-widget-previewer';

function WidgetPreview() {
  // Example Nostr smart widget event
  const widgetEvent = {
    id: "widget_event_id",
    pubkey: "widget_creator_pubkey",
    created_at: 1681234567,
    kind: 30033,
    tags: [
      ["d", "unique-identifier"],
      ["l", "basic"],
      ["image", "https://example.com/widget-image.jpg"],
      ["input", "Search for something..."],
      ["button", "Visit Website", "redirect", "https://example.com"],
      ["button", "Zap Creator", "zap", "creator@lightning.address"]
    ],
    sig: "widget_signature"
  };

  // Handle button interactions
  const handleNostrButton = (url) => {
    console.log('Nostr button clicked with URL:', url);
    // Process nostr URL or identifier
    return url; // Return processed URL if needed
  };

  const handleZapButton = (address) => {
    console.log('Zap button clicked with address:', address);
    // Process lightning address or invoice
    return address; // Return processed address if needed
  };

  return (
    <div className="widget-container">
      <h2>Smart Widget Preview</h2>
      
      <Widget 
        event={widgetEvent}
        onNostrButton={handleNostrButton}
        onZapButton={handleZapButton}
        width={400}
        widthUnit="px"
      />
    </div>
  );
}

export default WidgetPreview;
\`\`\`

## Widget Component Props

The \`Widget\` component accepts the following props:

| Prop | Type | Description |
|------|------|-------------|
| \`event\` | Object | Required - Nostr event object for the smart widget |
| \`onNextWidget\` | Function | Callback for when a new widget is returned after interaction |
| \`onZapButton\` | Function | Callback for handling zap button clicks, receives lightning address |
| \`onNostrButton\` | Function | Callback for handling nostr button clicks, receives nostr URL |
| \`onActionWidget\` | Function | Callback for handling action/tool widget clicks |
| \`width\` | Number | Width of the widget (defaults to 100% if not specified) |
| \`widthUnit\` | String | Unit for width: "px", "em", "rem", or "%" (defaults to "%") |
| \`buttonStyleClassName\` | String | Custom CSS class(es) for widget buttons |
| \`inputStyleClassName\` | String | Custom CSS class(es) for widget input field |
| \`widgetBackgroundColor\` | String | Custom background color (hex or RGB) |
| \`widgetBorderColor\` | String | Custom border color (hex or RGB) |
| \`widgetBorderRaduis\` | String | Custom border radius in pixels |
| \`userHexPubkey\` | String | Current user's public key in hex format |
| \`errorMessage\` | String | Custom error message for invalid widgets |

## Widget Types and Behavior

### Basic Widgets

Basic widgets can include:
- Image (required)
- Input field (optional)
- Up to 6 buttons with different actions

\`\`\`jsx
// Example of a basic widget event
const basicWidget = {
  id: "widget_event_id",
  pubkey: "widget_creator_pubkey",
  created_at: 1681234567,
  kind: 30033,
  tags: [
    ["d", "unique-identifier"],
    ["l", "basic"],
    ["image", "https://example.com/widget-image.jpg"],
    ["input", "Enter your search..."],
    ["button", "Visit Website", "redirect", "https://example.com"],
    ["button", "View Profile", "nostr", "nostr:npub1..."],
    ["button", "Send Zap", "zap", "user@lightning.address"]
  ],
  sig: "widget_signature"
};
\`\`\`

### Action/Tool Widgets

Action/Tool widgets are designed for single actions:
- Image (required)
- Icon (required but included in tags)
- Exactly 1 button (if including input, the button must be of type 'app')
- Clicking anywhere on the widget triggers the button action

\`\`\`jsx
// Example of an action widget event
const actionWidget = {
  id: "widget_event_id",
  pubkey: "widget_creator_pubkey",
  created_at: 1681234567,
  kind: 30033,
  tags: [
    ["d", "unique-identifier"],
    ["l", "action"],
    ["image", "https://example.com/widget-image.jpg"],
    ["icon", "https://example.com/widget-icon.png"],
    ["button", "Take Action", "app", "https://app.example.com/action"]
  ],
  sig: "widget_signature"
};
\`\`\`

## Button Types

The widget supports different types of buttons:

| Type | Description | Behavior |
|------|-------------|----------|
| \`redirect\` | Standard link | Opens URL in new tab |
| \`nostr\` | Nostr action | Calls \`onNostrButton\` with the URL |
| \`zap\` | Lightning payment | Calls \`onZapButton\` with the address |
| \`post\` | Form submission | Submits input data and can update the widget |
| \`app\` | App integration | Calls \`onActionWidget\` with the URL |

## Handling Widget Interactions

### Post Button Interaction

When a user interacts with a "post" type button, the widget will:
1. Submit the input value along with widget information to the specified URL
2. Process the response, which should be a new widget event
3. Update the displayed widget with the new content
4. Call \`onNextWidget\` with the new widget event

\`\`\`jsx
// Example handling the next widget update
function handleNextWidget(newWidgetEvent) {
  console.log('New widget received:', newWidgetEvent);
  // You can store this widget in state or handle it as needed
  return newWidgetEvent;
}

<Widget 
  event={widgetEvent}
  onNextWidget={handleNextWidget}
  userHexPubkey="user_pubkey_for_authentication"
/>
\`\`\`

### Action/Tool Widget Interaction

When a user clicks on an action/tool widget, the \`onActionWidget\` callback is called:

\`\`\`jsx
function handleActionWidget(url) {
  console.log('Action widget clicked with URL:', url);
  // Handle the action, such as opening a mini app or modal
}

<Widget 
  event={actionWidgetEvent}
  onActionWidget={handleActionWidget}
/>
\`\`\`

## Styling Widgets

You can customize the appearance of widgets using the provided props:

\`\`\`jsx
<Widget 
  event={widgetEvent}
  buttonStyleClassName="my-custom-button-class"
  inputStyleClassName="my-custom-input-class"
  widgetBackgroundColor="#f5f5f5"
  widgetBorderColor="#e0e0e0"
  widgetBorderRaduis="15"
  width={350}
  widthUnit="px"
/>
\`\`\`

## Complete Example

\`\`\`jsx
import React, { useState } from 'react';
import { Widget } from 'smart-widget-previewer';

function WidgetContainer() {
  const [currentWidget, setCurrentWidget] = useState({
    id: "widget_event_id",
    pubkey: "widget_creator_pubkey",
    created_at: 1681234567,
    kind: 30033,
    tags: [
      ["d", "unique-identifier"],
      ["l", "basic"],
      ["image", "https://example.com/widget-image.jpg"],
      ["input", "Search for content..."],
      ["button", "Search", "post", "https://api.example.com/search"],
      ["button", "View Creator", "nostr", "nostr:npub1..."],
      ["button", "Support", "zap", "creator@lightning.address"]
    ],
    sig: "widget_signature"
  });

  // Handle when a post button returns a new widget
  const handleNextWidget = (newWidget) => {
    setCurrentWidget(newWidget);
    return newWidget;
  };

  // Handle nostr button clicks
  const handleNostrButton = (url) => {
    console.log('Processing nostr URL:', url);
    // Here you would integrate with your Nostr client
    // Example: openNostrProfile(url);
    return url;
  };

  // Handle zap button clicks
  const handleZapButton = (address) => {
    console.log('Processing lightning address:', address);
    // Here you would integrate with your Lightning wallet
    // Example: openZapModal(address);
    return address;
  };

  // Handle action widget clicks
  const handleActionWidget = (url) => {
    console.log('Opening action at URL:', url);
    // Here you would handle the action
    // Example: openActionInFrame(url);
  };

  return (
    <div className="widget-demo">
      <h1>Smart Widget Demo</h1>
      
      <div className="widget-wrapper">
        <Widget 
          event={currentWidget}
          onNextWidget={handleNextWidget}
          onNostrButton={handleNostrButton}
          onZapButton={handleZapButton}
          onActionWidget={handleActionWidget}
          width={450}
          widthUnit="px"
          widgetBackgroundColor="#ffffff"
          widgetBorderColor="#dddddd"
          widgetBorderRaduis="12"
          userHexPubkey="user_hex_pubkey_here"
          errorMessage="Widget could not be displayed"
        />
      </div>
    </div>
  );
}

export default WidgetContainer;
\`\`\`

## Browser Compatibility

Smart Widget Previewer is compatible with all modern browsers that support React.

    `,
    subtitles: [
      {
        title: "Installation",
        id: slugify("Installation", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Basic Example",
        id: slugify("Basic Example", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Widget Component Props",
        id: slugify("Widget Component Props", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Widget Types and Behavior",
        id: slugify("Widget Types and Behavior", { lower: true, strict: true }),
        subtitles: [
          {
            title: "Basic Widgets",
            id: slugify("Basic Widgets", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Action/Tool Widgets",
            id: slugify("Action/Tool Widgets", {
              lower: true,
              strict: true,
            }),
          },
        ],
      },
      {
        title: "Button Types",
        id: slugify("Button Types", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Handling Widget Interactions",
        id: slugify("Handling Widget Interactions", {
          lower: true,
          strict: true,
        }),
        subtitles: [
          {
            title: "Post Button Interaction",
            id: slugify("Post Button Interaction", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Action/Tool Widget Interaction",
            id: slugify("Action/Tool Widget Interaction", {
              lower: true,
              strict: true,
            }),
          },
        ],
      },
      {
        title: "Styling Widgets",
        id: slugify("Styling Widgets", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Complete Example",
        id: slugify("Complete Example", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Browser Compatibility",
        id: slugify("Browser Compatibility", { lower: true, strict: true }),
        subtitles: [],
      },
    ],
  },
  "smart-widget-handler": {
    title: "Smart widget handler",
    content: `# Smart widget handler

A lightweight library for handling secure communication between Nostr web applications and nested iframes. It simplifies the parent-child window messaging pattern with a clean API for both client and host applications.

## Installation

\`\`\`bash
npm install smart-widget-handler
\`\`\`

or

\`\`\`bash
yarn add smart-widget-handler
\`\`\`

## Overview

Smart Widget Handler provides two main interfaces:

- **Client**: For applications running within iframes that need to communicate with their parent
- **Host**: For parent applications that need to communicate with embedded iframes

## Usage

### Import

\`\`\`javascript
import SWHandler from 'smart-widget-handler';

// Access client methods
const { client } = SWHandler;

// Access host methods
const { host } = SWHandler;
\`\`\`

## Client API (Iframe Application)

The client API helps iframe applications communicate with their parent.

### Notify Parent About Readiness

Tell the parent that the iframe is loaded and ready:

\`\`\`jsx
import React, { useEffect } from 'react';
import SWHandler from 'smart-widget-handler';

function WidgetApp() {
  useEffect(() => {
    // Notify parent application that this widget is ready
    SWHandler.client.ready();
    
    // Or specify a parent origin
    // SWHandler.client.ready('https://parent-domain.com');
  }, []);
  
  return <div>Widget content</div>;
}
\`\`\`

### Listen for Messages (client)

Listen for messages from the parent:

\`\`\`jsx
import React, { useEffect, useState } from 'react';
import SWHandler from 'smart-widget-handler';

function WidgetApp() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Notify parent we're ready
    SWHandler.client.ready();
    
    // Set up listener for parent messages
    const listener = SWHandler.client.listen((data) => {
      console.log('Received message from parent:', data);
      
      // Handle user metadata
      if (data.kind === 'user-metadata') {
        setUser(data.data.user);
      }
    });
    
    // Clean up listener on component unmount
    return () => listener.close();
  }, []);
  
  return (
    <div>
      {user ? (
        <div>Hello, {user.name || user.display_name}!</div>
      ) : (
        <div>Loading user data...</div>
      )}
    </div>
  );
}
\`\`\`

### Request Event Signing

Request the parent to sign a Nostr event:

\`\`\`jsx
import React from 'react';
import SWHandler from 'smart-widget-handler';

function SignButton() {
  const handleSignRequest = () => {
    const eventDraft = {
      content: 'This is a test note',
      tags: [['t', 'test']],
      kind: 1
    };

    SWHandler.client.requestEventSign(
      eventDraft,
      'https://parent-domain.com' // parent origin
    );
  };
  
  return (
    <button onClick={handleSignRequest}>
      Sign Note
    </button>
  );
}
\`\`\`

### Request Event Signing and Publishing

Request the parent to sign and publish a Nostr event:

\`\`\`jsx
import React, { useState } from 'react';
import SWHandler from 'smart-widget-handler';

function PublishForm() {
  const [content, setContent] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const eventDraft = {
      content,
      tags: [['t', 'widget-post']],
      kind: 1
    };

    SWHandler.client.requestEventPublish(
      eventDraft,
      'https://parent-domain.com' // parent origin
    );
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
      />
      <button type="submit">Publish Note</button>
    </form>
  );
}
\`\`\`

### Requesting Payment

Request the host to initiate a Lightning payment:

\`\`\`js
import SWHandler from "smart-widget-handler";

const paymentRequest = {
  address: "lnbc1...", // or LNURL, or Lightning address
  amount: 1000, // sats (ignored if address is a BOLT11 invoice)
  nostrPubkey: "npub1example...", // optional
  nostrEventIDEncode: "note1example...", // optional
};

SWHandler.client.requestPayment(paymentRequest, "https://myapp.com");
\`\`\`

### Send Custom Data

Send custom string data to the parent:

\`\`\`jsx
import React from 'react';
import SWHandler from 'smart-widget-handler';

function CustomActionButton() {
  const sendCustomData = () => {
    SWHandler.client.sendContext(
      JSON.stringify({ 
        customAction: 'doSomething', 
        data: { value: 123 } 
      }),
      'https://parent-domain.com' // parent origin
    );
  };
  
  return (
    <button onClick={sendCustomData}>
      Trigger Custom Action
    </button>
  );
}
\`\`\`

## Host API (Parent Application)

The host API helps parent applications communicate with embedded iframes.

### Listen for Messages (host)

Listen for messages from the iframe:

\`\`\`jsx
import React, { useEffect, useRef } from 'react';
import SWHandler from 'smart-widget-handler';

function WidgetContainer() {
  const iframeRef = useRef(null);
  
  useEffect(() => {
    const listener = SWHandler.host.listen((data) => {
      console.log('Received message from iframe:', data);
      
      if (data.kind === 'sign-event') {
        // Handle sign request
        // ...
      }
    });
    
    return () => listener.close();
  }, []);
  
  return (
    <div className="widget-container">
      <iframe 
        ref={iframeRef}
        src="https://trusted-widget.com" 
        title="Nostr Widget"
      />
    </div>
  );
}
\`\`\`

### Send User Context

Send Nostr user data to the iframe:

\`\`\`jsx
import React, { useEffect, useRef } from 'react';
import SWHandler from 'smart-widget-handler';

function WidgetContainer({ userProfile }) {
  const iframeRef = useRef(null);
  
  useEffect(() => {
    // Wait for iframe to load
    const handleIframeLoad = () => {
      SWHandler.host.sendContext(
        userProfile,
        window.location.origin, // host origin (optional, defaults to "*")
        'https://trusted-widget.com', // iframe origin
        iframeRef.current // iframe element reference
      );
    };
    
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
      return () => iframe.removeEventListener('load', handleIframeLoad);
    }
  }, [userProfile]);
  
  return (
    <iframe 
      ref={iframeRef}
      src="https://trusted-widget.com" 
      title="Nostr Widget"
    />
  );
}

// Usage
function App() {
  const userProfile = {
    pubkey: '00000000000000000000000000000000000000000000000000000000000000000',
    display_name: 'User', 
    name: 'username',
    picture: 'https://example.com/avatar.jpg',
    banner: 'https://example.com/banner.jpg',
    nip05: 'user@example.com',
    lud16: 'user@lightning.wallet',
    lud06: 'lightning:address',
    website: 'https://example.com',
    hasWallet: false // optional for when the connected user has at least one conencted wallet
  };
  
  return (
    <WidgetContainer userProfile={userProfile} />
  );
}
\`\`\`

### Send Nostr Event

Send a signed/published Nostr event to the iframe:

\`\`\`jsx
import React, { useRef } from 'react';
import SWHandler from 'smart-widget-handler';

function WidgetWithEventHandling() {
  const iframeRef = useRef(null);
  
  const sendSignedEvent = () => {
    const nostrEvent = {
      pubkey: '00000000000000000000000000000000000000000000000000000000000000000',
      id: 'event_id',
      content: 'Hello from Nostr!',
      created_at: Math.floor(Date.now() / 1000),
      tags: [['p', 'recipient_pubkey']],
      sig: 'signature',
      kind: 1
    };
    
    SWHandler.host.sendEvent(
      nostrEvent,
      'success', // or 'error'
      'https://trusted-widget.com', // iframe origin
      iframeRef.current // iframe element reference
    );
  };
  
  return (
    <div>
      <iframe 
        ref={iframeRef}
        src="https://trusted-widget.com" 
        title="Nostr Widget"
      />
      <button onClick={sendSignedEvent}>
        Send Signed Event to Widget
      </button>
    </div>
  );
}
\`\`\`

### Send Error

Send an error message to the iframe:

\`\`\`jsx
import React, { useRef } from 'react';
import SWHandler from 'smart-widget-handler';

function WidgetWithErrorHandling() {
  const iframeRef = useRef(null);
  
  const sendError = () => {
    SWHandler.host.sendError(
      'An error occurred while processing your request',
      'https://trusted-widget.com', // iframe origin
      iframeRef.current // iframe element reference
    );
  };
  
  return (
    <div>
      <iframe 
        ref={iframeRef}
        src="https://trusted-widget.com" 
        title="Nostr Widget"
      />
      <button onClick={sendError}>
        Simulate Error
      </button>
    </div>
  );
}
\`\`\`

### Sending Payment Response

Send a payment response from the host to the client:

\`\`\`js
import SWHandler from "smart-widget-handler";

const paymentResponse = {
  status: true, // true for success, false for error
  preImage: "abcdef123456...", // optional, only for successful payments
};

SWHandler.host.sendPaymentResponse(paymentResponse, "https://trusted-widget.com", <YOUR_IFRAME_ELEMENT>);
\`\`\`


## Complete Example

### Client (Iframe) Application - React

\`\`\`jsx
import React, { useState, useEffect } from 'react';
import SWHandler from 'smart-widget-handler';

function WidgetApp() {
  const [user, setUser] = useState(null);
  const [signedEvents, setSignedEvents] = useState([]);
  const [content, setContent] = useState('');
  
  useEffect(() => {
    // Notify parent we're ready
    SWHandler.client.ready();
    
    // Set up listener for parent messages
    const listener = SWHandler.client.listen((data) => {
      console.log('Received message from parent:', data);
      
      if (data.kind === 'user-metadata') {
        setUser(data.data.user);
      } else if (data.kind === 'nostr-event' && data.data.status === 'success') {
        // Add the signed event to our list
        setSignedEvents(prev => [...prev, data.data.event]);
      }
    });
    
    // Clean up on unmount
    return () => listener.close();
  }, []);
  
  const handlePublish = () => {
    if (!content.trim()) return;
    
    SWHandler.client.requestEventPublish(
      {
        content,
        tags: [],
        kind: 1
      },
      window.location.ancestorOrigins[0]
    );
    
    // Clear the input
    setContent('');
  };
  
  if (!user) {
    return <div>Loading user data...</div>;
  }
  
  return (
    <div className="widget-container">
      <div className="user-info">
        <img src={user.picture} alt={user.name} width="50" height="50" />
        <h2>{user.display_name || user.name}</h2>
      </div>
      
      <div className="publish-form">
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={4}
        />
        <button onClick={handlePublish}>Publish Note</button>
      </div>
      
      {signedEvents.length > 0 && (
        <div className="events-list">
          <h3>Your Notes</h3>
          {signedEvents.map((event) => (
            <div key={event.id} className="event-card">
              <p>{event.content}</p>
              <small>
                {new Date(event.created_at * 1000).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WidgetApp;
\`\`\`

### Host (Parent) Application - React

\`\`\`jsx
import React, { useEffect, useRef, useState } from 'react';
import SWHandler from 'smart-widget-handler';

function WidgetHostApp() {
  const iframeRef = useRef(null);
  const [widgetReady, setWidgetReady] = useState(false);
  
  // User profile data
  const userProfile = {
    pubkey: '00000000000000000000000000000000000000000000000000000000000000000',
    display_name: 'User Name',
    name: 'username',
    picture: 'https://example.com/avatar.jpg',
    banner: 'https://example.com/banner.jpg',
    nip05: 'user@example.com',
    lud16: 'user@lightning.wallet',
    lud06: 'lightning:address',
    website: 'https://example.com'
  };
  
  useEffect(() => {
    // Listen for messages from the widget
    const listener = SWHandler.host.listen((data) => {
      console.log('Message from widget:', data);
      
      if (data.kind === 'app-loaded') {
        setWidgetReady(true);
        
        // Send user data to the widget
        SWHandler.host.sendContext(
          userProfile,
          window.location.origin,
          'https://trusted-widget.com',
          iframeRef.current
        );
      } else if (data.kind === 'sign-publish') {
        // Handle sign and publish request
        const eventToSign = data.data;
        
        // After signing the event (typically with a Nostr signer)
        const signedEvent = {
          ...eventToSign,
          pubkey: userProfile.pubkey,
          created_at: Math.floor(Date.now() / 1000),
          id: 'calculated_id', // Would be calculated from event data
          sig: 'generated_signature' // Would be generated from private key
        };
        
        // Send signed event back to iframe
        SWHandler.host.sendEvent(
          signedEvent,
          'success',
          'https://trusted-widget.com',
          iframeRef.current
        );
        
        // In a real app, you would then publish to relays
        console.log('Publishing event to relays:', signedEvent);
      }
    });
    
    return () => listener.close();
  }, []);
  
  return (
    <div className="app-container">
      <h1>Host Application</h1>
      
      <div className="widget-wrapper">
        <h2>Embedded Widget</h2>
        <iframe 
          ref={iframeRef}
          src="https://trusted-widget.com" 
          title="Nostr Widget"
          width="100%"
          height="500px"
          style={{ border: '1px solid #ccc', borderRadius: '8px' }}
        />
      </div>
      
      <div className="widget-status">
        Widget Status: {widgetReady ? 'Ready' : 'Loading...'}
      </div>
    </div>
  );
}

export default WidgetHostApp;
\`\`\`

## TypeScript Support

Smart Widget Handler includes TypeScript definitions for all functions and interfaces.

## API Reference

### Client

| Method | Description | Parameters |
|--------|-------------|------------|
| \`ready(parentOrigin)\` | Notify parent about readiness | \`parentOrigin\`: Parent origin (optional) |
| \`listen(callback)\` | Listen for parent messages | \`callback\`: Function to handle messages |
| \`requestEventSign(context, origin)\` | Request event signing | \`context\`: Nostr event draft<br>\`origin\`: Parent origin |
| \`requestEventPublish(context, origin)\` | Request event signing and publishing | \`context\`: Nostr event draft<br>\`origin\`: Parent origin |
| \`sendContext(context, origin)\` | Send custom data | \`context\`: String data<br>\`origin\`: Parent origin |

### Host

| Method | Description | Parameters |
|--------|-------------|------------|
| \`listen(callback)\` | Listen for iframe messages | \`callback\`: Function to handle messages |
| \`sendContext(context, host_origin, origin, iframe)\` | Send user data | \`context\`: User data object<br>\`host_origin\`: Parent origin (optional)<br>\`origin\`: Iframe origin<br>\`iframe\`: Iframe element |
| \`sendEvent(context, status, origin, iframe)\` | Send Nostr event | \`context\`: Nostr event object<br>\`status\`: 'success' or 'error'<br>\`origin\`: Iframe origin<br>\`iframe\`: Iframe element |
| \`sendError(errMessage, origin, iframe)\` | Send error message | \`errMessage\`: Error message string<br>\`origin\`: Iframe origin<br>\`iframe\`: Iframe element |

### Message Types

The library uses different message types identified by the \`data.kind\` property to handle various communication scenarios between host and client. Here's a comprehensive list of all available message types:

| Message Type | Direction | Description |
|-------------|-----------|-------------|
| \`user-metadata\` | Host → Client | Contains Nostr account information of the connected user |
| \`nostr-event\` | Host → Client | Contains a signed and/or published Nostr event |
| \`err-msg\` | Host → Client | Contains an error message from the host |
| \`payment-response\` | Host → Client | Contains the result of a payment request (success/failure) |
| \`app-loaded\` | Client → Host | Notifies the host that the client widget is loaded and ready |
| \`sign-event\` | Client → Host | Requests the host to sign a Nostr event |
| \`sign-publish\` | Client → Host | Requests the host to sign and publish a Nostr event |
| \`payment-request\` | Client → Host | Requests the host to make a Lightning payment |
| \`custom-data\` | Client → Host | Contains custom data sent from the client to the host |

When implementing listeners with \`SWHandler.host.listen()\` or \`SWHandler.client.listen()\`, you can filter and handle these message types based on your application's needs.


## Use Cases

- **Nostr Widgets**: Create widgets that can request signing or publishing of events
- **Web Applications**: Create plugin systems with secure iframe communication
- **Microfrontends**: Facilitate communication between independently deployed frontend components
- **Nostr Clients**: Embed third-party widgets securely while sharing user context
- **Payment Applications**: Securely embed payment windows into applications

   `,
    subtitles: [
      {
        title: "Installation",
        id: slugify("Installation", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Overview",
        id: slugify("Overview", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Usage",
        id: slugify("Usage", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "Client API (Iframe Application)",
        id: slugify("Client API (Iframe Application)", {
          lower: true,
          strict: true,
        }),
        subtitles: [
          {
            title: "Notify Parent About Readiness",
            id: slugify("Notify Parent About Readiness", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Listen for Messages (client)",
            id: slugify("Listen for Messages (client)", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Request Event Signing",
            id: slugify("Request Event Signing", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Request Event Signing and Publishing",
            id: slugify("Request Event Signing and Publishing", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Requesting Payment",
            id: slugify("Requesting Payment", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Send Custom Data",
            id: slugify("Send Custom Data", {
              lower: true,
              strict: true,
            }),
          },
        ],
      },
      {
        title: "Host API (Parent Application)",
        id: slugify("Host API (Parent Application)", {
          lower: true,
          strict: true,
        }),
        subtitles: [
          {
            title: "Listen for Messages (host)",
            id: slugify("Listen for Messages (host)", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Send User Context",
            id: slugify("Send User Context", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Send Nostr Event",
            id: slugify("Send Nostr Event", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Send Error",
            id: slugify("Send Error", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Sending Payment Response",
            id: slugify("Sending Payment Response", {
              lower: true,
              strict: true,
            }),
          },
        ],
      },
      {
        title: "Complete Example",
        id: slugify("Complete Example", { lower: true, strict: true }),
        subtitles: [
          {
            title: "Client (Iframe) Application - React",
            id: slugify("Client (Iframe) Application - React", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Host (Parent) Application - React",
            id: slugify("Host (Parent) Application - React", {
              lower: true,
              strict: true,
            }),
          },
        ],
      },
      {
        title: "TypeScript Support",
        id: slugify("TypeScript Support", { lower: true, strict: true }),
        subtitles: [],
      },
      {
        title: "API Reference",
        id: slugify("API Reference", { lower: true, strict: true }),
        subtitles: [
          {
            title: "Client",
            id: slugify("Client", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Host",
            id: slugify("Host", {
              lower: true,
              strict: true,
            }),
          },
          {
            title: "Message Types",
            id: slugify("Message Types", {
              lower: true,
              strict: true,
            }),
          },
        ],
      },
      {
        title: "Use Cases",
        id: slugify("Use Cases", { lower: true, strict: true }),
        subtitles: [],
      },
    ],
  },
};
