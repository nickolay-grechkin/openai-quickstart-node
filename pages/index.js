import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";
import PptxGenJS from "pptxgenjs";

export default function Home() {
  const [textInput, setTextInput] = useState("");
  const [imageDescriptionInput, setImageDescriptionInput] = useState("");
  const [textResult, setTextResult] = useState();
  const [imageResult, setImageResult] = useState([]);

  async function sendRequest(endpoint, requestData, isTextGeneration) {
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestData }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      if (endpoint === 'generate-text') {
        setTextResult(data.result);
        setTextInput("");
      } else {
        setImageResult(data.result);
        setImageDescriptionInput("");
      }
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    await sendRequest('generate-text', textInput);
    await sendRequest('generate-image', imageDescriptionInput);
  }

  const downloadPresentation = () => {
      // const b64Image = localStorage.getItem("imageUrl");
    let pres = new PptxGenJS();

    let slides = []
    if (imageResult) {
        imageResult.map((item) => {
          const base64String = 'data:image/png;base64,' + item.b64_json;

          slides[1] = pres.addSlide()

          slides[1].addImage({
            data: base64String,
            x: "0%",
            y: "0%",
            w: "100%",
            h: "100%"
          })

          slides[1].addText(textResult, {
            x: 0,
            y: 1,
            w: "100%",
            h: 2,
            align: "center",
            color: "0088CC",
            fontSize: 24,
          });
        });
      }
      pres.writeFile();
  }

  return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main className={styles.main}>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="text"
            placeholder="Enter a text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <input
              type="text"
              name="image"
              placeholder="Enter an image description"
              value={imageDescriptionInput}
              onChange={(e) => setImageDescriptionInput(e.target.value)}
          />
          <input type="submit" value="Generate names" />
        </form>
        <div className={styles.result}>{textResult}</div>
        <div className={styles.imageWrapper}>
          {imageResult.map(img => (
                <img className={styles.generatedImage} src={'data:image/png;base64,' + img.b64_json} />
          ))}
        </div>
        <button className={styles.downloadPresentation} onClick={downloadPresentation}>Download Powerpoint Presentation</button>
      </main>
    </div>
  );
}
