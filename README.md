# PupiGo | Proyecto Integrador 1 (PI1)

## Table of Contents
1. [Description](#description)
   1. [Context](#context)
   2. [Problem](#problem)
   3. [Proposed Solution](#proposed-solution)
2. [Product Vision](#product-vision)
3. [Target Group](#target-group)
4. [Needs](#needs)
5. [Business Goals](#business-goals)
6. [Alternative Solutions](#alternative-solutions)
7. [MVP Scope](#mvp-scope)
8. [Domain Model (MER)](#domain-model-mer)
9. [How to Run](#how-to-run)
10. [Project Management](#project-management)
11. [Authors](#authors)
12. [Course Information](#course-information)

## Description

### Context

For several semesters, the EAFIT University student community has reported a sustained increase in robbery incidents along the route connecting the university with the metro station, particularly during the afternoon and evening hours. Students raised their concerns with university leadership, pointing out that these incidents not only caused economic harm but also directly affected the emotional stability of those involved and generated a widespread sense of insecurity and fear among everyone who had to travel that route daily.

As a first response, the student community itself organized an informal accompaniment group known as **"Caminantes"**, where students coordinated their departures by chat, agreed on a meeting point, and walked the route together. Once it became clear that this measure did not solve the underlying problem, the community requested additional support from the city government and the university's security staff, which considerably reduced the number of robberies.

However, the solution that ultimately became the most viable for providing calm and safety was transportation managed by the university itself: initially a van with limited capacity, nicknamed by the community as the **"Pupi móvil"**, which covered routes at certain times, and which later evolved into a higher-capacity collective bus (**"el colectivo"**). This solution is still managed completely informally through the WhatsApp group **"Caminantes EAFIT"**, where students ask via a sticker that reads *"¿Por dónde pasa el Pupi móvil?"* ("Where is the Pupi móvil right now?") and wait for someone who has the information to reply.

This dynamic means that students waiting at the meeting points — whether at the university, next to **Las Hermosas**, or at the metro station's stop — depend entirely on someone informed responding in the group in order to make a decision. As a result, they don't know for certain when the bus will arrive, they lose time waiting without reliable information, and in many cases end up walking alone rather than risk missing the transport, exposing themselves again to the very risk that started the whole problem.

### Problem

With the purpose of reducing the uncertainty and waiting times of students who depend on the EAFIT–metro transportation service, the student community requested the development of an information system that provides real-time visibility of the transport, replacing informal chat-based coordination with a formal web platform.

The system must allow **users** to be registered, who can create an account on the platform by providing information such as a unique identifier, full name, institutional email, password, role (student, driver, or administrator), and registration date.

The system will include **collectives** (buses), representing the vehicles assigned to the transport service, uniquely identified by a license plate or internal identifier. Each collective will store information such as its passenger capacity and its status (active or inactive). Each collective may have a **driver** assigned per shift, linked to a system user with the corresponding role.

The system will allow **routes** to be defined, identified by a unique code, describing the path the transport follows between an origin point and a destination point, along with its regular operating schedule. Each route will be made up of one or more **stops**, understood as the meeting points recognized by the community (for example, **Las Hermosas** or the metro stop), identified by a name and its geographic location.

Every time a collective covers a route at a given time, the system will record a **trip**, uniquely identified, storing the associated route, the assigned collective, the driver in charge, the start time, the end time, and its status (in progress, finished, or cancelled). During each trip, the system will periodically capture the collective's **real-time location**, recording latitude, longitude, and the corresponding timestamp, in order to show its position on the map to users who are waiting.

Users will be able to receive **notifications** related to a specific trip, for example when the collective is close to their stop or when there is a change to the usual route. They will also be able to generate **incident reports**, recording the type of incident, a description, the location where it occurred, and the date, in order to keep the community informed about relevant events during the route.

The system will also allow users to check their **trip history**, i.e., the trips they have previously followed or used through the platform.

In a later phase, the system must support seat management through **reservations**, identified by a unique code, linking a user to a specific trip and recording its status (confirmed, waitlisted, or cancelled). Each confirmed reservation may have an associated **QR code validation**, recording the generated code and the timestamp at which the driver validated the passenger's boarding.

### Proposed Solution

**PupiGo** is a web application, accessible from a URL with no installation required, that replaces informal chat-based coordination with a formal, real-time visibility system for the EAFIT–metro transport service. On an interactive map, students can see the collective's current location, the route it is following, and the estimated arrival time at their stop, as well as receive notifications when the bus is nearby.

The solution is built incrementally across sprints, prioritizing first the point of greatest technical uncertainty (real-time tracking) before moving on to user experience features, seat management, and administration:

- **Sprint 1 (MVP):** real-time location of the collective on a map.
- **Sprint 2:** notifications and incident reporting.
- **Sprint 3:** seat management — reservations, waitlist, cancellations, and QR code validation.
- **Sprint 4:** administrative panel — route, schedule, and driver management, plus statistics.

## Product Vision

Our motivation is to reduce the uncertainty that students experience on their trip between EAFIT and the metro, giving them clear and timely access to the information they need to know what to expect. We want them to stop losing time waiting without knowing whether the bus will arrive or not, and for that waiting and travel time to be reduced by having real, accessible information exactly when they need it. The positive change we want to achieve is for students to be able to plan their departure with certainty, without depending on blindly coordinating with other classmates or taking risks due to lack of information.

**"Menos espera, más certeza."** *(Less waiting, more certainty.)*

*(See the full Product Vision Board template in `/docs/product-vision-board.png` or the course form link)*

## Target Group

We are targeting EAFIT students who use the transport service (**el colectivo**, formerly the **"Pupi móvil"**) to travel between the university and the metro station, especially during the afternoon and evening hours, which carry the highest risk. In particular, we are thinking of students who have classes until late, students who fully depend on this transport because they have no other safe alternative, and students who currently end up walking alone because they don't know whether they'll make it in time to catch the bus.

## Needs

The problem we are solving is the lack of real-time information about the transport: students don't know for certain when the bus will arrive, they lose time waiting without knowing whether it's worth staying or walking, and they often end up making the trip alone rather than risk missing it. The benefit we offer is reducing that uncertainty and that risk exposure, giving them real visibility into where the bus is, which route it's following, and how much longer until it arrives.

## Business Goals

For the university, this app represents a direct benefit to student wellbeing and safety, which is precisely what has driven all the prior investment in **Caminantes** and **el colectivo**. The business goals are: reduce the perception of insecurity and complaints related to the EAFIT-metro route, increase students' trust in the existing transport service, and, over time, through the administrative panel, give those who manage the service real data on routes and schedules to optimize resources.

## Alternative Solutions

The solution considered most viable for providing calm and safety was implementing what was initially named the **"Pupi móvil"**, a van with limited seating that covered routes at certain times. It was later replaced with a higher-capacity collective bus. This is managed through the group called **"Caminantes EAFIT"**, where people ask via a sticker that reads *"Por donde pasa el Pupi móvil"* against a background image of the famous van nicknamed by the community. Through this, people waiting at the university stops — next to **Las Hermosas** — or at the metro — next to the stop by the station — manage to "find out" the transport's location and make decisions accordingly. However, to this day there is no app or formal system that gives them real visibility of the transport; everything depends on someone with the information responding to the sticker in the group and letting those waiting know.

## MVP Scope

Domain entities scoped to Sprint 1 only (see full MER detail in the repository Wiki):

- **User**
- **Driver**
- **Collective**
- **Route**
- **Stop**
- **Trip**
- **RealTimeLocation**

Out of scope for the MVP (later phases): Notification, Incident Report, Trip History, Reservation, and QR Code Validation.

## Domain Model (MER)

Work on the domain model and upload the image to the repository, or link it from a tool such as LucidChart or Draw.io. It is suggested to upload it directly to the repository's **Wiki**.

*Link: [MER PupiGo](/Challenges/01/Diagrams/eRPupiGo.pdf)*

## How to Run

*(Section to be completed once the technical setup is defined — dependency installation instructions, environment variables, and how to run the project in Django)*

### Requirements
- **Programming Language:** Python
- **Framework:** Django
- **Tools:** *(pending)*

### Installation
```
# pending
```

### Execution
```
# pending
```

## Project Management

This project is managed using **GitHub Projects (Kanban)** and **Backlog**, following the **MoSCoW** prioritization method (Must have, Should have, Could have, Won't have) for the user stories in each sprint.

*Kanban board: [pending]*
*Backlog: [pending]*

## Authors

**Miguel Ángel Colorado Castaño** <br>
**Juan Diego Muñoz Buitrago** <br>
**Daniel Mauricio Giraldo Moreno** <br>
**Juan Jose Velez Garcia** <br>
**Julian Peña Ochoa** <br>
**Samuel Montoya Espinosa**


## Course Information
**Course:** ST0251 Proyecto Integrador 1 (PI1)
**Professor:** Wilmer Alberto Gil Moreno
**University:** EAFIT University | School of Applied Sciences and Engineering
**Program:** Systems Engineering
**Year:** 2026-2

PI1 is a project-based course where prior knowledge (past, present, and future) is leveraged to develop software products through various challenges. The course applies agile practices and evolutionary engineering across four sprints, delivering an MVP with impactful functionality.

**Technical requirements:** Web application, Python and Django, Data Analytics.
**Teamwork:** Teams of 3 to 5 students, working in English, no changes allowed to team composition or project after the first deliverable.
**Development practices:** Layers (MVC/MVT), Modeling, Continuous Integration, Continuous Delivery.
