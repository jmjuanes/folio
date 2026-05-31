---
title: "Welcome & Overview"
description: "Quick overview of what Folio is and how to get started."
permalink: "/introduction.html"
nextPage: "installation.md"
quickstart:
  - icon: "globe"
    title: "Web App"
    description: "Use our web app version of Folio directly in your browser."
    href: "/app"
  - icon: "server"
    title: "Self Hosted"
    description: "Install Folio Studio in your local machine for full control."
    href: "/studio/installation.html"
---

{{>>folio::alert}}
⚠️ **Folio Studio** is currently in an **experimental phase**. Breaking changes may occur between versions, potentially leading to data loss. **Please use with caution and make regular backups**.
{{/folio::alert}}

## What is Folio?

**Folio** is a modular, open-source whiteboard engine built with **React** and **SVG**, designed for flexibility, extensibility, and seamless integration.

## What is Folio Studio?

**Folio Studio** is the full-featured version of Folio, designed for local use with support for multiple boards and advanced configuration. 

## Quickstart

<!--html-->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
{{#each @page.quickstart}}
    <a href="{{this.href}}" class="p-6 border-1 border-gray-300 rounded-xl">
        <div class="flex items-center text-3xl mb-3">
            {{>folio::icon icon=this.icon}}
        </div>
        <div class="font-bold text-base mb-1">{{this.title}}</div>
        <div class="opacity-80 text-sm">{{this.description}}</div>
    </a>
{{/each}}
</div>
<!--/html-->
