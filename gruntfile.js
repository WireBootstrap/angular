module.exports = function(grunt) {

    grunt.initConfig({
 
        pkg: grunt.file.readJSON('package.json'),

        copy: {
        
            package: {
                src: './package.npm.json',
                dest: '../component/package.json',
            },
            component: {
                src: './wirebootstrap/wire.component.ts',
                dest: '../component/wire.component.ts',
            },
            readme: {
                src: './README.md',
                dest: '../component/README.md',
            }            

        }
      
    });
  
    grunt.loadNpmTasks('grunt-contrib-copy');
    
    grunt.registerTask('default', ['copy']);
 
};