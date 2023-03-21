export const DUMMY_SEGMENTS = [
	{
		"start": 0,
		"finish": 29,
		"text": "",
		"lowLabel": "greeting",
		"highLabel": null,
	},
	{
		"start": 29,
		"finish": 61,
		"text": "Open Man model and Galaxy background (You can download at description)",
		"highLabel": "Open",
		"lowLabel": "description"
	},
	{
		"start": 61,
		"finish": 126,
		"text": "Use polygonal Lasso Tool to face cut",
		"highLabel": "Lasso Tool",
		"lowLabel": "instruction"
	},
	{
		"start": 126,
		"finish": 162,
		"text": "Add Threshold effect to face",
		"highLabel": "Threshold Effect",
		"lowLabel": "tip"
	},
	{
		"start": 162,
		"finish": 182,
		"text": "Use Color Range to select black color",
		"highLabel": "Color Range",
		"lowLabel": "instruction"
	},
	{
		"start": 182,
		"finish": 206,
		"text": "Add new Document",
		"highLabel": "New Document",
		"lowLabel": "goal"
	},
	{
		"start": 206,
		"finish": 250,
		"text": "Add Gradient",
		"highLabel": "Gradient",
		"lowLabel": "instruction"
	},
	{
		"start": 250,
		"finish": 323,
		"text": "Move Face to new Document",
		"highLabel": "Mouse+Keyboard",
		"lowLabel": "goal"
	},
	{
		"start": 323,
		"finish": 352,
		"text": "Move Galaxy background to new document",
		"highLabel": "Mouse+Keyboard",
		"lowLabel": "goal"
	},
	{
		"start": 352,
		"finish": 363,
		"text": "Hold ALT key and move Mouse control and click",
		"highLabel": "Mouse Control",
		"lowLabel": "instruction"
	},
	{
		"start": 363,
		"finish": 410,
		"text": "Ctrl + T to edit size Galaxy Background",
		"highLabel": "Edit Size",
		"lowLabel": "instruction"
	},
	{
		"start": 410,
		"finish": 431,
		"text": "Add Bevel & Emboss",
		"highLabel": "Filter",
		"lowLabel": "instruction"
	},
	{
        "start": 431,
        "finish": 491,
        "text": "Add text",
        "highLabel": "Text",
        "lowLabel": "instruction"
    },
    {
        "start": 491,
        "finish": 512,
        "text": "Duplicate Galaxy background",
        "highLabel": "Duplicate",
        "lowLabel": "goal"
    },
    {
        "start": 512,
        "finish": 521,
        "text": "Hold ALT key and move Mouse control and click",
        "highLabel": "Mouse Control",
        "lowLabel": "instruction"
    },
    {
        "start": 521,
        "finish": 534,
        "text": "Edit position Galaxy 2 background",
        "highLabel": "Edit Position",
        "lowLabel": "instruction"
    },
    {
        "start": 534,
        "finish": 583,
        "text": "Copy layer style of face and paste to text layer",
        "highLabel": "Layer Style",
        "lowLabel": "instruction"
    },
]
  
  

export const DUMMY_SEGMENTS2 = [
	{
		title: "Polygonal Lasso",
		"goal": {
			start: 0,
			finish: 10,
			script: "Polygonal Lasso",
		},
		"tool": {
			start: 10,
			finish: 20,
			script: "Polygonal Lasso",
		},
	},
	{
		title: "Layer Via Copy",
		"instruction": {
			start: 20,
			finish: 30,
			script: "Layer Via Copy",
		},
		"outcome": {
			start: 30,
			finish: 405,
			script: "Layer Via Copy",
		},
	},
	{
		title: "Threshold",
	},
	{
		title: "Color Range",
	},
	{
		title: "New Gradient Fill Layer",
	},
	{
		title: "Name Change",
	},
	{
		title: "Drag Selection",
	},
	{
		title: "Move",
	},
	{
		title: "Free Transform",
	},
	{
		title: "Align Horizontal Centers",
	},
	{
		title: "Name Change",
	},
	{
		title: "Select Canvas",
	},
	{
		title: "Paste",
	},
	{
		title: "Name Change",
	},
	{
		title: "Create Clipping Mask",
	},
	{
		title: "Move",
	},
	{
		title: "Free Transform",
	},
	{
		title: "Move",
	},
	{
		title: "Layer Style",
	},
	{
		title: "New Type Layer",
	},
	{
		title: "Layer Via Copy",
	},
	{
		title: "Name Change",
	},
	{
		title: "Layer Order",
	},
	{
		title: "Create Clipping Mask",
	},
	{
		title: "Move",
	},
	{
		title: "Paste Style",
	},
	{
		title: "Stamp Visible",
	},

];
/*
0:00
Start
0:29
Open Man model and Galaxy background (You can download at description)
1:01
Use polygonal Lasso Tool to face cut
2:06
Add Threshold effect to face
2:42
Use Color Range to select black color
3:05
Add new Document
3:26
Add Gradient
4:10
Move Face to new Document
5:23
Move Galaxy background to new document
5:52
Hold ALT key and move Mouse control and click
6:03
Ctrl + T to edit size Galaxy Background
6:50
Add Bevel & Emboss
7:11
Add text
8:16
Duplicate Galaxy background
8:32
Hold ALT key and move Mouse control and click
8:39
Edit position Galaxy 2 background
8:54
Copy layer style of face and paste to text layer
9:43
End


Example:
{
	highLabel: "Polygonal Lasso", // name of the tool used
	lowLabel: "goal", // information type from ["outcome", "goal", "instruction", "description"]
	start: 0.0, // seconds
	finish: 50.0, // seconds
	script: "Text" // text
}

*/

