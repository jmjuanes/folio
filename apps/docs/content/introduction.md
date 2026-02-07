---
{
    "title": "Introduction",
    "description": "Quick overview of what Folio is and how to get started.",
    "permalink": "/introduction.html",
    "nextPage": "/studio/installation.html",
    "layout": "docs.mustache",
    "quickstart": [
        {
            "icon": "globe",
            "title": "Web App",
            "description": "Use our web app version of Folio directly in your browser.",
            "url": "/app"
        },
        {
            "icon": "server",
            "title": "Self Hosted",
            "description": "Install Folio Studio in your local machine for full control.",
            "url": "/studio/installation.html"
        }
    ]
}
---

{{>>alert.mustache}}
⚠️ **Folio Studio** is currently in an **experimental phase**. Breaking changes may occur between versions, potentially leading to data loss. **Please use with caution and make regular backups**.
{{/alert.mustache}}

## What is Folio?

**Folio** is a modular, open-source whiteboard engine built with **React** and **SVG**, designed for flexibility, extensibility, and seamless integration.

## What is Folio Studio?

**Folio Studio** is the full-featured version of Folio, designed for local use with support for multiple boards and advanced configuration. 

## Quickstart

<!--html-->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
{{#each page.attributes.quickstart}}
    <a href="{{this.url}}" class="p-6 border-1 border-gray-800 rounded-xl">
        <div class="flex items-center text-3xl mb-3">
            {{=icon icon=this.icon}}
        </div>
        <div class="font-bold text-base mb-1">{{this.title}}</div>
        <div class="opacity-80 text-sm">{{this.description}}</div>
    </a>
{{/each}}
</div>
<!--/html-->
