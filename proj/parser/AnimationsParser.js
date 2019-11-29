    const animationsParser = {
    /**
     * Parses animations
     * @param  {XMLCollection Object} animationsNode
     * @param  {MyScene} sceneGraph
     */
    parseAnimations: (animationsNode, sceneGraph) => {
        const children = animationsNode.children;
        sceneGraph.animations = {};

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName != 'animation') {
                sceneGraph.onXMLMinorError(`unknown tag <${children[i].nodeName}>`)
                continue;
            }

            const animationID = parserUtils.reader.getString(children[i], 'id');

            const isLoop = parserUtils.reader.hasAttribute(children[i], 'isLoop');

            if (!animationID) return 'no ID defined for animation!';


            if (sceneGraph.animations[animationID])
                return `ID must be unique for each animation (conflict: ID =  ${animationID})`;

            const keyframes = animationsParser.parseKeyframes(children[i], sceneGraph, animationID);
            sceneGraph.animations[animationID] = new KeyframeAnimation(sceneGraph.scene, keyframes, isLoop);
        }
    },

    
    /**
     * Parses all the keyframes of a specific animation
     * @param  {XMLCollection Object} keyframeNodes
     * @param  {MyScene} sceneGraph
     * @param  {String} animationID
     */
    parseKeyframes: (keyframeNodes, sceneGraph, animationID) => {
        const children = keyframeNodes.children;
        const keyframes = [];

        for (let i = 0; i < children.length; i++) {
            const keyframe = children[i];
            const currentKeyframe = {};

            if (keyframe.nodeName != 'keyframe') {
                sceneGraph.onXMLMinorError(`unknown tag <${keyframe.nodeName}>`)
                continue;
            }

            const instant = parserUtils.reader.getFloat(keyframe, 'instant');
            
            if (instant == null) {
                sceneGraph.onXMLError(`No instant defined for ${keyframe}`);
                return -1;
            }

            currentKeyframe.instant = instant * 1000;

            const animations = keyframe.children;

            const translate = animations[0];

            if (translate.nodeName != 'translate') {
                sceneGraph.onXMLError(`Translate not in
                 the first index in the keyframe of instant ${instant} on animation ${animationID}`);
                return -1;
            }

            const rotate = animations[1];

            if (rotate.nodeName != 'rotate') {
                sceneGraph.onXMLError(`rotate not in
                 the second index in the keyframe of instant ${instant} on animation ${animationID}`);
                return -1;
            }

            const scale = animations[2];

            if (scale.nodeName != 'scale') {
                sceneGraph.onXMLError(`scale not in
                 the second index in the keyframe of instant ${instant} on animation ${animationID}`);
                return -1;
            }

            currentKeyframe.translate = parserUtils.parseCoordinates3D(translate, `
            Invalid coordinates for translation in instant ${instant} on animation ${animationID}`)
            
            currentKeyframe.scale = parserUtils.parseCoordinates3D(scale, `
            Invalid coordinates for scale in instant ${instant} on animation ${animationID}`)

            currentKeyframe.rotation = animationsParser.parseRotation(rotate, sceneGraph);
            keyframes.push(currentKeyframe);
        }
        return keyframes;
    },

    /**
     * Parses the rotation information
     * @param  {XMLCollection Object} rotateNode
     * @param  {MyScene} sceneGraph
     */
    parseRotation: (rotateNode, sceneGraph) => {
        const angleX = parserUtils.reader.getFloat(rotateNode, 'angle_x');
        if(angleX == null){
            sceneGraph.onXMLError('No angle x on current rotation!');
            return null;
        }

        const angleY = parserUtils.reader.getFloat(rotateNode, 'angle_y');
        if(angleY == null){
            sceneGraph.onXMLError('No angle y on current rotation!');
            return null;
        }


        const angleZ = parserUtils.reader.getFloat(rotateNode, 'angle_z');
        if(angleZ == null){
            sceneGraph.onXMLError('No angle z on current rotation!');
            return null;
        }
        return {
            angleX: angleX * DEGREE_TO_RAD,
            angleY: angleY * DEGREE_TO_RAD,
            angleZ: angleZ * DEGREE_TO_RAD
        }
    }

};