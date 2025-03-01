<img width="1121" alt="Screenshot 2025-02-25 at 11 56 16 AM" src="https://github.com/user-attachments/assets/030769ac-ed9f-4d6e-a4b6-95ff8ff80e81" />

## Inspiration  
The internet is a 24/7 conversation, constantly generating news, opinions, and debates. Traditional media struggles to keep up, and with its flaws – we've seen the rise and popularity of [Citizen Internet Journalism](https://en.wikipedia.org/wiki/Digital_journalism#Citizen_journalism) providing unfiltered on-the-ground reporting from everyday people.

In the [East](https://www.youtube.com/@JasonLivinginChina) and the [West](https://www.youtube.com/@CashJordan) <br>

Unfortunately, these forms are still flawed – often doing whatever it takes to get views (e.g. fake AI generated provacative cover images) <br>
![Screenshot 2025-02-24 at 9 18 18 AM](https://github.com/user-attachments/assets/22410432-fee9-4b33-b861-2d1b3ef8c205)


AI has the potential to bridge the gaps in traditional and digital journalism. 
We wanted to build an **AI-powered news show** that captures and contextualizes trending stories in **real time**, bringing fresh, AI-generated commentary to the digital world.  

- [ ]  Could we **break** the echo-chambers of the internet with a fresh voice?  
- [ ]  Could that **give pause** – and prompt people to think differently and consider other perspectives?  <br>

Inspired by the chaotic, unfiltered discussions happening online, **A Bot’s Take** was born: a news show where AI-powered anchors analyze, report, and react to the internet’s biggest stories.  

## What it does  
<img src="https://github.com/user-attachments/assets/705d54e2-e6cf-435b-8f1c-ed6da45c23c9" alt="a bot's take logo" width="200"/> <br>

**A Bot’s Take** is an AI-driven news show streamed on **Twitch**, featuring **two AI anchors** that deliver commentary and insights on trending stories. Based of the futuristic TV-show Futurama – we have *Linda, a composed and optimistic news anchor*, and *Morbo, an alien calling out any foolishness and future doom of the news covered.*

The show pulls from **Reddit’s front page** to bring in the most discussed content. The anchors' avatars speak with **AI-generated voices from ElevenLabs**, adding personality and flair to the commentary. The show includes an **animated news ticker** at the bottom, keeping the energy fast-paced and engaging, while the **topic headline** updates dynamically. The content is fully automated, with real-time updates and minimal human intervention.

## How we built it  
![design diagram fixed](https://github.com/user-attachments/assets/887e6392-02ac-43d6-b304-d09233d669d3)

- **Initial development**: We used **Lovable**, a promptable AI full-stack engineer, to generate the initial boilerplate code and the foundational UI for the project.  
- **Code editing & refinement**: After setting the base, we utilized **Cursor** to fine-tune the codebase and implement more advanced features.  
- **AI-powered narration**: For voice generation, we leveraged **ElevenLabs**, providing high-quality AI-generated voices for our two anchors suited for their stark personalities.  
- **UI & animation**: We incorporated a **dynamic news ticker** at the bottom of the screen to keep the content visually engaging.
- **LLM Observability**: We used **PostHog** to track the usage of the LLMs.
- **Content processing & summarization**: We use **OpenAI’s gpt-4o** to extract and summarize key insights from trending Reddit posts, ensuring the news show remains informative and relevant.  
- **Real-time streaming**: We stream the show live on **Twitch**, creating a seamless experience for viewers to tune in to AI-generated content in real time.  
- **Dynamic Content**: The pipeline is designed to continuously fetch new content and automatically generate new episodes, ensuring minimal manual intervention.  

## Challenges we ran into  
- **3 Project Pivots**: Simultaneously we tried an [AI Podcast Show](https://github.com/justinmae/ai-podcaster-convo), an [AI Podcast Host](https://github.com/iamarsenibragimov/ai-podcaster-experience) where anyone could be a guest, then an AI debating show (current repo initially) before landing on this idea. We'd like to thank **Lovable** for the ability to prototype quickly and pivot without too much pain.

<img src="https://github.com/user-attachments/assets/d823a034-39f9-4f44-907e-04653765e75c" alt="loving lovable" width="400"/> <br>

- **Balancing Unfiltered Expression, Unwarranted Bias, and Lack of Context**: Sometimes the anchor (Morbo) gives comments lacking in context. We found our Reddit scrape could sometimes miss the full context behind topics and hence, lead to a shallow reporting. <br> e.g. Image of an anchor's comment. Zenlensky was recently offering to resign to seal Ukraine's NATO membership. However, Morbo's comment in isolation is not a fair view, and could lead to listeners missing the full picture. 

<img src="https://github.com/user-attachments/assets/ad2b5772-9028-4a95-aadd-8dd1467c2da2" alt="Zenlensky comment" width="900"/> <br>


- **Ensuring relevance & filtering noise**: Not all trending Reddit posts are suitable for the show. We used OpenAI to provide intelligence in filtering out NSFW content, then scrape the top 50 posts and rank by newsworthiness – picking the top 10 to report on.
- **AI-generated content tone**: Creating AI-generated commentary that feels natural and engaging is a challenge. We focused on optimizing the **humor, tone, and flow** of the content to feel more human-like.  
- **Dynamic Content**: Ensuring the system runs autonomously while maintaining content quality required adjustments to our **automation pipelines**.
- **Streaming Platform**: Initially, we wanted to stream on YouTube, but we were blocked. We explored alternatives and found Twitch. We then uploaded that recording to YouTube.
- **3 Timezones of asynchronous collaboration**: We're a team of 3 strangers working from New York, the Netherlands, and Australia – there's only a few hours we're all awake.


## Accomplishments that we're proud of  
- **Fully automated AI-driven news show**: We created a dynamic, real-time news show that streams on **Twitch**.  
- **Seamless AI anchor integration**: We built two AI anchors with distinct personalities, delivering commentary in a natural and engaging way.  
- **Developed an animated news ticker**: While the anchors remain static, the **animated news ticker** keeps the show visually exciting.  
- **Integrated multiple AI technologies**: We combined **OpenAI’s LLMs**, **ElevenLabs**, and **Twitch Streaming** for a cohesive and automated experience.  
- **Leveraged strengths of high and low levels of abstraction in AI-assisted development**: We used Lovable for the skeleton of our codebase, and Cursor for the meat.
- **Scalable content pipeline**: We built a system capable of continuously generating content as internet trends evolve.

## What we learned  
- **Human-like AI expression**: Balancing AI automation with a more **human-like tone** is essential for creating engaging content.  
- **Effective filtering and curation**: The quality of the content we deliver is as important as the speed with which we source it.  
- **Seamless tech integration**: Combining various AI tools like **ElevenLabs**, **OpenAI**, and **Twitch** into a unified experience is crucial for the success of an automated show.  
- **Real-time automation**: Generating content and streaming in real time presents unique challenges, but offers significant scalability potential.

## What's next for *A Bot’s Take*  
- **Increase Context for Anchors**: To prevent shallow reporting on the information contained in the Reddit post – it's important we expand the context referenced by the agent to provide a fuller picture of a topic.
- **Expanding AI personalities & emotions**: We want to enhance the anchors’ **expressiveness** through animated facial expressions and avatars, making them more relatable to viewers.  
- **Switch-out Anchors**: We want the option of choosing who anchors your news. With different anchors having different biases and personalities. This would help cover more perspectives and allow personalisation of experience.
- **Integrating viewer interactions**: We plan to incorporate real-time user submissions or voting to influence the content. And make consuming the news a more active process and less one-way channel.  
- **Exploring multiple content formats**: Short-form clips for **social media** could expand the reach of the show.  
- **Enhancing video production**: We may explore adding more sophisticated **video animations** to improve the visual appeal of the show.  
- **Multi-language support**: We want to make the show more accessible to a wider audience by supporting multiple languages.

  
*A Bot’s Take* is just the beginning—**the internet speaks, AI reports!**

---

### Built with
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Lovable
- ElevenLabs
- OpenAI
- Twitch Streaming
- Vercel
- Cursor
- Reddit API
- PostHog


#  Info about Lovable project

## Project info

**URL**: https://lovable.dev/projects/f38b66c6-692a-43cd-8ccf-3e0b2e1993ce

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/f38b66c6-692a-43cd-8ccf-3e0b2e1993ce) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/f38b66c6-692a-43cd-8ccf-3e0b2e1993ce) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
