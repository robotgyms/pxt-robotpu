# Material Specifications
---

### 1. Type / model (型号)

* **What to write:** `MG90` (or `MG90S` if your version has full metal gears)
* **Description:** This identifies the specific product model. It is a highly popular 9g-class micro servo widely used in robotics platforms like Robot PU.

### 2. Technical data (规格/参数)

* **What to write:*** 
> * **Dimensions:** $22.8 \text{ mm} \times 12.2 \text{ mm} \times 28.5 \text{ mm}$
> * **Weight:** $13.4\text{ g}$
> * **Operating Voltage:** $4.8\text{V} - 6.0\text{V}$
> * **Stall Torque:** $1.8 \text{ kg}\cdot\text{cm}$ (at $4.8\text{V}$), $2.2 \text{ kg}\cdot\text{cm}$ (at $6.0\text{V}$)
> * **Operating Speed:** $0.1\text{ sec}/60^\circ$ (at $4.8\text{V}$), $0.08\text{ sec}/60^\circ$ (at $6.0\text{V}$)
> * **Gear Type:** Metal gears with one plastic gear (or Full Metal Gears for MG90S)
> * **Rotation Angle:** $180^\circ$ (Standard) / $360^\circ$ (Continuous Rotation variant)
>
>


* **Description:** This outlines the physical and electrical limits of the servo. Make sure to check if your specific batch is $180^\circ$ or $360^\circ$, as both exist under this model number.

### 3. Standard (标准)

* **What to write:** `JB/T 11993-2014` (for Chinese industrial manufacturing standards) or `Manufacturer Internal QC Standard` / `GB/T 26825-2011`
* **Description:** If this is for an official import/export or compliance document, smaller electronic components like RC servos usually fall under general low-voltage or small-power motor standards. If no precise national standard is mandated by your supplier, **"Manufacturer Standard" (企业标准)** is widely accepted.

### 4. Mark(s) of conformity (认证情况)

* **What to write:** `CE, RoHS`
* **Description:** Most reputable iterations of the MG90/MG90S servo comply with European safety and environmental standards. **CE** indicates compliance with health, safety, and environmental protection standards for products sold within the European Economic Area, and **RoHS** guarantees that the servo is free from hazardous substances (like lead or cadmium) on its circuit board and solder points.

Here is how you should fill out those four fields for your robot's **TPU 95A plastic enclosure**.

Since this is a custom-fabricated plastic part (likely 3D printed or injection molded) rather than an off-the-shelf electronic component, the documentation focus shifts toward the raw material properties and manufacturing compliance.

---

### 1. Type / model (型号)

* **What to write:** `Robot PU Custom Plastic Enclosure (TPU 95A)`
* **Description:** This specifies exactly what the part is and identifies the specific material grade used in its production. "TPU 95A" tells the reviewer it is a Thermoplastic Polyurethane with a Shore hardness of 95A.

### 2. Technical data (规格(参数))

* **What to write:*** 
> * **Material:** Thermoplastic Polyurethane (TPU)
> * **Hardness:** 95A Shore (Flexible, high impact resistance)
> * **Tensile Strength:** Approx. 35–50 MPa (Depending on printing/molding orientation)
> * **Elongation at Break:** > 400%
> * **Melting Temperature / Printing Temp:** 210°C – 230°C
> * **Flame Retardancy Grade:** UL94 HB (Standard for raw TPU filament/pellets, unless specified as V-0 flame-retardant)
>
>


* **Description:** This outlines the mechanical and thermal properties of the enclosure. TPU 95A is highly praised in robotics for being semi-flexible yet extremely durable against drops.

### 3. Standard (标准)

* **What to write:** `ISO 9001:2015` (for the manufacturing process) and/or `ASTM D412` (the international standard for testing tension properties of thermoplastic elastomers).
* **Alternative (if 3D printed internally):** `Manufacturer Engineering Specification` or `Additive Manufacturing Process Standard`.
* **Description:** Because it is a custom enclosure, it doesn't have its own standalone national standard. Instead, you cite the testing standards used to verify the TPU material's properties or the quality management system under which it was fabricated.

### 4. Mark(s) of conformity (认证情况)

* **What to write:** `RoHS Compliant, REACH Compliant`
* **Description:** * **RoHS & REACH:** Almost all standard industrial TPU 95A raw filaments or pellets (from reputable brands like PolyMaker, Ninjatek, etc.) are certified RoHS and REACH compliant, meaning the plastic does not contain restricted hazardous heavy metals or substances of very high concern.
* *Note on CE:* Since a plastic shell is a non-electrical/passive component, it typically does not receive its own independent **CE** mark. The CE mark will apply to the *entire integrated robot system* later, rather than the raw plastic enclosure by itself.

Here is how you can fill out those four fields if your robot's enclosure is made from **TPE (Thermoplastic Elastomer)** instead of TPU.

While TPE is in the same flexible polymer family as TPU, it is generally softer, more rubber-like, and offers a different texture and flex profile.

---

### 1. Type / model (型号)

* **What to write:** `Robot PU Custom Plastic Enclosure (TPE)`
* **Description:** Identifies the custom component's role in the robot assembly and specifies the base material family.

### 2. Technical data (规格(参数))

* **What to write:** 
> * **Material:** Thermoplastic Elastomer (TPE)
> * **Hardness Range:** Typically 83A – 90A Shore (Softer and more rubber-like than TPU 95A)
> * **Tensile Strength:** Approx. 15–30 MPa (Depending on the exact grade and fabrication orientation)
> * **Elongation at Break:** > 500% (Highly elastic with excellent fatigue resistance)
> * **Processing / Printing Temp:** 210°C – 240°C
> * **Flame Retardancy Grade:** UL94 HB (Standard rating for raw, non-modified TPE)
>
>


* **Description:** Outlines the mechanical traits. TPE provides superior dampening and vibration absorption for robotics, though it is usually more flexible and elastic than standard TPU.

### 3. Standard (标准)

* **What to write:** `ISO 9001:2015` (for manufacturing quality control) and `ASTM D412` / `ISO 37` (the international testing standards for tensile properties of vulcanized rubber and thermoplastic elastomers).
* **Description:** Since this is a custom structural enclosure, it doesn't possess an off-the-shelf product standard. Citing the international material testing standards (`ASTM D412`) or your facility's quality management system (`ISO 9001`) satisfies compliance frameworks.

### 4. Mark(s) of conformity (认证情况)

* **What to write:** `RoHS Compliant, REACH Compliant`
* **Description:** * **RoHS & REACH:** Standard engineering-grade TPE filaments and raw pellets comply with these European environmental directives, certifying that the enclosure is free from hazardous heavy metals and restricted chemical substances.
* **CE Note:** As a passive plastic part, it does not qualify for an independent CE mark. The finished, fully assembled robot will bear the CE mark as a whole system.

